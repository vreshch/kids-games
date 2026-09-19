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

test('unknown routes get the kid-friendly 404', async ({ page }) => {
  await page.goto('/no-such-game');
  await expect(page.getByText('This room is empty!')).toBeVisible();
});
