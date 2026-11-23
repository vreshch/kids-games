import { expect, test } from '@playwright/test';

import { GAMES } from '../src/lib/games';

test('home shows the game grid and byline', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: "Alisa's Games" })).toBeVisible();
  for (const game of GAMES) {
    await expect(page.getByRole('link', { name: new RegExp(game.title) })).toBeVisible();
  }
  await expect(page.getByText('Made by Alisa')).toBeVisible();
});

for (const game of GAMES) {
  test(`${game.slug} loads without page errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    const response = await page.goto(`/${game.slug}`);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('link', { name: /all games/ })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('crystal rooms shows the start overlay', async ({ page }) => {
  await page.goto('/crystal-rooms');
  await expect(page.getByText('spell the secret word', { exact: false })).toBeVisible();
});

test('tanky town starts a game with touch controls', async ({ page }) => {
  await page.goto('/tanky-town');
  // Play only answers once React has hydrated, so retry the tap until the level shows.
  await expect(async () => {
    await page.getByRole('button', { name: 'Play', exact: true }).click({ timeout: 1000 });
    await expect(page.getByText('Brick Garden', { exact: false })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Fire' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Drive pad' })).toBeVisible();
});

test('tanky town: a friend joins by link and both play the same game', async ({
  page,
  context,
}) => {
  await page.goto('/tanky-town');
  // The button only answers once React has hydrated, so retry until the link shows.
  await expect(async () => {
    await page.getByRole('button', { name: /Play together/ }).click({ timeout: 1000 });
    await expect(page.getByText('Waiting for your friend')).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  const link = await page.getByLabel('Game link').inputValue();
  expect(link).toMatch(/\/tanky-town\?room=[a-z0-9]{6}$/);

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

test('frankie feeds a singer a fruit', async ({ page }) => {
  await page.goto('/frankie');
  // The tray only answers once React has hydrated, so retry the first pick until it sticks.
  await expect(async () => {
    await page.getByRole('button', { name: 'Bam, a singer' }).click();
    await expect(page.getByText('tap an empty spot to drop Bam')).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Empty spot 1' }).click();
  await page.getByRole('button', { name: /^Mango/ }).click();
  // Singers bob on stage forever, so Playwright never sees them settle.
  await page.getByRole('button', { name: 'Feed Mango to Bam' }).click({ force: true });
  await expect(page.getByRole('img', { name: 'Bam full of Mango' })).toBeVisible();
});

test('about tells the story', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByText('Alisa Vreshch')).toBeVisible();
});

test('paper book has a working QR code page for every game', async ({ page }) => {
  await page.goto('/book');
  await expect(page.getByRole('heading', { name: 'Paper Book' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Print the book/ })).toBeVisible();
  for (const game of GAMES) {
    await expect(
      page.getByRole('img', { name: `QR code for ${game.title}` }).first()
    ).toBeVisible();
  }
  await expect(page.getByRole('img', { name: 'QR code for all the games' }).first()).toBeVisible();
});

test('unknown routes get the kid-friendly 404', async ({ page }) => {
  await page.goto('/no-such-game');
  await expect(page.getByText('This room is empty!')).toBeVisible();
});

test('wiggle snakes starts and the super button fires', async ({ page }) => {
  await page.goto('/wiggle-snakes');
  await expect(page.getByText('Eat the glowing dots', { exact: false })).toBeVisible();
  // Play only answers once React has hydrated, so retry until the in-game HUD shows up.
  await expect(async () => {
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Super power' })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await expect(page.getByText('Biggest snakes')).toBeVisible();
  await expect(page.getByText('SUPER!')).toBeVisible();
  await page.getByRole('button', { name: 'Super power' }).click();
  await expect(page.getByText('SUPER!')).toBeHidden();
});

test('secret pet land: knock on the present three times to find the kitten', async ({ page }) => {
  await page.goto('/secret-pet-land');
  const present = page.getByRole('button', { name: 'Present' });
  // The world mounts only after hydration, so retry the first knock until it registers.
  await expect(async () => {
    await present.click();
    await expect(page.getByText('Knock...')).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await present.click();
  await present.click();
  await expect(page.getByText('You found the Kitten!')).toBeVisible();
  await expect(page.getByText('🐾 1/7')).toBeVisible();
});

test('secret pet land: drag seeds and water onto the soil to grow a cabbage', async ({ page }) => {
  await page.goto('/secret-pet-land');
  const dragTo = async (from: string, to: string) => {
    const a = (await page.getByRole('button', { name: from, exact: true }).boundingBox())!;
    const b = (await page.getByRole('button', { name: to, exact: true }).boundingBox())!;
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
    await page.mouse.up();
  };
  const soil = page.getByRole('button', { name: 'Soil' });
  // The world mounts only after hydration, so retry until the farm nav answers.
  await expect(async () => {
    await page.getByRole('button', { name: /Farm/ }).click();
    await expect(soil).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await dragTo('Seeds', 'Soil');
  await expect(soil).toHaveText('🌱');
  await dragTo('Water', 'Soil');
  await expect(soil).toHaveText('🥬');
});
