import { test, expect } from '@playwright/test';
import { registerCustomer, uniqueEmail, uniquePhone } from './helpers.js';

test.describe('Customer order flow', () => {
  test('can browse cakes', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: /Our Cakes/i })).toBeVisible();
    // Category tabs render
    await expect(page.getByRole('button', { name: /All/i }).first()).toBeVisible();
  });

  test('can open a product detail page', async ({ page }) => {
    await page.goto('/products');
    // Click the first cake link in the grid
    const firstCake = page.locator('a[href^="/products/"]').first();
    await firstCake.click();
    await expect(page).toHaveURL(/\/products\/\d+/);
    await expect(page.getByRole('heading', { name: /Customize your cake/i })).toBeVisible();
  });

  test('unauthenticated place-order redirects to login', async ({ page }) => {
    await page.goto('/products');
    await page.locator('a[href^="/products/"]').first().click();
    // Pick delivery date if available
    const dateSel = page.locator('select').first();
    await dateSel.selectOption({ index: 1 }).catch(() => {}); // first available
    await page.getByRole('button', { name: /Sign in to Order|Place Order/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('full flow: register → order → success', async ({ page }) => {
    await registerCustomer(page, {
      name: 'E2E Customer',
      email: uniqueEmail(),
      phone: uniquePhone(),
      password: 'password123',
    });
    // Shop → pick a cake
    await page.goto('/products');
    await page.locator('a[href^="/products/"]').first().click();
    // Pick a delivery date (first option is placeholder)
    await page.locator('select').first().selectOption({ index: 1 });
    await page.getByRole('button', { name: /Place Order/i }).click();
    await page.waitForURL('/order-success', { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Order Placed/i })).toBeVisible();
    await expect(page.getByText(/Pending Confirmation/i)).toBeVisible();
  });

  test('my orders page shows the new order', async ({ page }) => {
    await registerCustomer(page, {
      name: 'E2E Orders Customer',
      email: uniqueEmail(),
      phone: uniquePhone(),
      password: 'password123',
    });
    await page.goto('/products');
    await page.locator('a[href^="/products/"]').first().click();
    await page.locator('select').first().selectOption({ index: 1 });
    await page.getByRole('button', { name: /Place Order/i }).click();
    await page.waitForURL('/order-success', { timeout: 15000 });
    await page.goto('/my-orders');
    await expect(page.getByRole('heading', { name: /My Orders/i })).toBeVisible();
    // Just-placed order should appear with an #id reference
    await expect(page.locator('text=/#\\d+/').first()).toBeVisible({ timeout: 10000 });
  });
});
