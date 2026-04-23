import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders hero with CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Delicious cakes/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Cakes/i }).first()).toBeVisible();
  });

  test('navbar has shop and contact links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Shop/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Contact/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Sign In/i }).first()).toBeVisible();
  });

  test('browse cakes navigates to products', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Browse Cakes/i }).first().click();
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole('heading', { name: /Our Cakes/i })).toBeVisible();
  });
});
