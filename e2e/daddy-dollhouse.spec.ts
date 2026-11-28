import { expect, test } from '@playwright/test';

test('daddy dollhouse: elevator, present, secret and night party', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  await page.goto('/daddy-dollhouse');
  const daddy = page.getByRole('button', { name: 'Daddy', exact: true });
  // Taps only answer once React has hydrated, so retry the selection until it sticks.
  await expect(async () => {
    await daddy.click({ timeout: 1000 });
    await expect(daddy).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  const groundY = (await page.getByRole('button', { name: 'Yellow room' }).boundingBox())!.y;
  await page.getByRole('button', { name: 'Pink room' }).click();
  // Walk, doors close, ride, doors open: Daddy ends up on the top floor.
  await expect
    .poll(async () => (await daddy.boundingBox())!.y, { timeout: 8000 })
    .toBeLessThan(groundY);
  for (let tap = 0; tap < 3; tap++) await page.getByRole('button', { name: 'Present' }).click();
  await expect(page.getByLabel('Things you have').getByRole('img', { name: 'key' })).toBeVisible();
  await page.getByRole('button', { name: 'Picture' }).click();
  await expect(page.getByRole('img', { name: '1 of 3 secrets found' })).toBeVisible();
  await page.getByRole('button', { name: 'Window' }).first().click();
  await expect(page.getByRole('button', { name: 'Window' }).first()).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  expect(errors).toEqual([]);
});
