import { spawn, type ChildProcess } from 'node:child_process';

import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const RELAY_HEALTH = 'http://127.0.0.1:3001/relay/health';

// These tests own the relay, so one of them can restart it; they run one after another.
test.describe.configure({ mode: 'serial' });

let relay: ChildProcess | null = null;

async function startRelay() {
  relay = spawn('node', ['--experimental-strip-types', 'relay/relay.ts'], {
    env: { ...process.env, RELAY_ORIGINS: 'http://127.0.0.1:3100' },
    stdio: 'inherit',
  });
  await expect(async () => expect((await fetch(RELAY_HEALTH)).ok).toBe(true)).toPass({
    timeout: 10_000,
  });
}

async function stopRelay() {
  const running = relay;
  relay = null;
  if (!running || running.exitCode !== null) return;
  const gone = new Promise((resolve) => running.once('exit', resolve));
  running.kill('SIGTERM');
  await gone;
}

test.beforeAll(startRelay);
test.afterAll(stopRelay);

/** The host opens the game and taps Play together; returns the link for the friend. */
async function hostRoom(page: Page, slug: string, open = true) {
  if (open) await page.goto(`/${slug}`);
  // The button only answers once React has hydrated, so retry until the link shows.
  await expect(async () => {
    await page.getByRole('button', { name: /Play together/ }).click({ timeout: 1000 });
    await expect(page.getByText('Waiting for your friend')).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  const link = await page.getByLabel('Game link').inputValue();
  expect(link).toMatch(new RegExp(`/${slug}\\?room=[a-z0-9]{6}$`));
  return link;
}

/** The friend opens the link and taps Join until `ready` shows. */
async function joinRoom(friend: Page, link: string, ready: () => Promise<void>) {
  await friend.goto(link);
  await expect(async () => {
    await friend.getByRole('button', { name: /Join your friend/ }).click({ timeout: 1000 });
    await ready();
  }).toPass({ timeout: 15_000 });
}

test('tanky town: a friend joins by link and both play the same game', async ({
  page,
  context,
}) => {
  const link = await hostRoom(page, 'tanky-town');

  const friend = await context.newPage();
  await friend.goto(link);
  await expect(async () => {
    await friend.getByRole('button', { name: /Join your friend/ }).click({ timeout: 1000 });
    await expect(friend.getByText('Brick Garden', { exact: false })).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 15_000 });
  await expect(page.getByText('Brick Garden', { exact: false })).toBeVisible();
  await expect(page.getByText('you 🟡')).toBeVisible();
  await expect(friend.getByText('you 🟢')).toBeVisible();
  await expect(friend.getByLabel('5 lives')).toBeVisible();

  await friend.close();
  await expect(page.getByText('Your friend left', { exact: false })).toBeVisible();
});

test('wiggle snakes: a friend joins by link and each has its own snake', async ({
  page,
  browser,
}) => {
  const link = await hostRoom(page, 'wiggle-snakes');

  // A second browser, like a friend on another phone: its own storage and its own snake.
  const other = await browser.newContext();
  const friend = await other.newPage();
  await friend.goto(link);
  await expect(async () => {
    await friend.getByRole('button', { name: /Join your friend/ }).click({ timeout: 1000 });
    await expect(friend.getByRole('button', { name: 'Super power' })).toBeVisible({
      timeout: 3000,
    });
  }).toPass({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Super power' })).toBeVisible();
  for (const screen of [page, friend]) {
    await expect(screen.getByText(/\. You$/)).toBeVisible();
    await expect(screen.getByText(/👫 Friend/)).toBeVisible();
  }

  // The friend's tap goes to the host's game and comes back: only the friend's super fires.
  await expect(friend.getByText('SUPER!')).toBeVisible();
  await friend.getByRole('button', { name: 'Super power' }).click();
  await expect(friend.getByText('SUPER!')).toBeHidden();
  await expect(page.getByText('SUPER!')).toBeVisible();

  await other.close();
  await expect(page.getByText('Friend left')).toBeVisible();
});

/** Lets the host's relay socket through, or holds it shut while `blocked`. */
async function gate(host: BrowserContext) {
  const state = { blocked: false };
  await host.routeWebSocket(/\/relay\//, (ws) => {
    if (state.blocked) ws.close({ code: 1011, reason: 'held back by the test' });
    else ws.connectToServer();
  });
  return state;
}

/** A relay restart (every deploy) with the friend back first: each must keep its seat. */
async function restartRelay(hostGate: { blocked: boolean }) {
  hostGate.blocked = true;
  await stopRelay();
  await startRelay();
  await expect(async () => {
    const health = (await (await fetch(RELAY_HEALTH)).json()) as { data: { sockets: number } };
    expect(health.data.sockets).toBe(1);
  }).toPass({ timeout: 10_000 });
  return () => (hostGate.blocked = false);
}

test('tanky town: after a relay restart the host stays host and both play on', async ({
  page,
  browser,
}) => {
  test.setTimeout(60_000);
  const hostGate = await gate(page.context());
  const link = await hostRoom(page, 'tanky-town');
  const other = await browser.newContext();
  const friend = await other.newPage();
  await joinRoom(friend, link, () =>
    expect(friend.getByText('Brick Garden', { exact: false })).toBeVisible({ timeout: 2000 })
  );
  await expect(friend.getByText('you 🟢')).toBeVisible();
  await expect(page.getByText('you 🟡')).toBeVisible();

  const hostBack = await restartRelay(hostGate);
  await expect(friend.getByText('Your friend left', { exact: false })).toBeVisible();
  await expect(page.getByText('Connection lost', { exact: false })).toBeVisible();
  hostBack();

  await expect(friend.getByText('Your friend left', { exact: false })).toBeHidden({
    timeout: 15_000,
  });
  await expect(page.getByText('Connection lost', { exact: false })).toBeHidden();
  await expect(page.getByText('you 🟡')).toBeVisible();
  await expect(friend.getByText('you 🟢')).toBeVisible();
  await expect(friend.getByText('Brick Garden', { exact: false })).toBeVisible();
  await other.close();
});

test('wiggle snakes: after a relay restart the host stays host and the friend comes back', async ({
  page,
  browser,
}) => {
  test.setTimeout(60_000);
  const hostGate = await gate(page.context());
  const link = await hostRoom(page, 'wiggle-snakes');
  const other = await browser.newContext();
  const friend = await other.newPage();
  await joinRoom(friend, link, () =>
    expect(friend.getByRole('button', { name: 'Super power' })).toBeVisible({ timeout: 3000 })
  );

  const hostBack = await restartRelay(hostGate);
  await expect(friend.getByText('Waiting for them to come back')).toBeVisible();
  await expect(friend.getByText('Send this link')).toBeHidden();
  hostBack();

  await expect(friend.getByText('Waiting for them to come back')).toBeHidden({ timeout: 15_000 });
  await expect(friend.getByText('Send this link')).toBeHidden();
  await expect(page.getByText(/Joining your friend|Send this link/)).toBeHidden();
  await expect(page.getByText('Connecting...')).toBeHidden();
  await other.close();
});

test('a host who reloads the page is still the host', async ({ page, browser }) => {
  const link = await hostRoom(page, 'tanky-town');
  await page.reload();
  await expect(page.getByText('Join your friend')).toBeHidden();
  expect(await hostRoom(page, 'tanky-town', false)).toBe(link);
  const other = await browser.newContext();
  const friend = await other.newPage();
  await joinRoom(friend, link, () =>
    expect(friend.getByText('Brick Garden', { exact: false })).toBeVisible({ timeout: 2000 })
  );
  await expect(friend.getByText('you 🟢')).toBeVisible();
  await expect(page.getByText('you 🟡')).toBeVisible();
  await other.close();
});
