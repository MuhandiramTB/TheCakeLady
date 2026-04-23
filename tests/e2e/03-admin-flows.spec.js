import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers.js';

test.describe('Admin flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('dashboard shows stats', async ({ page }) => {
    await expect(page.getByText('Customers')).toBeVisible();
    await expect(page.getByText(/Total Orders|Delivered/i).first()).toBeVisible();
  });

  test('can navigate to all admin pages', async ({ page }) => {
    for (const [path, heading] of [
      ['/admin/orders', /Orders|Today/i],
      ['/admin/products', /Cakes/i],
      ['/admin/categories', /Categor/i],
      ['/admin/users', /Customers/i],
      ['/admin/store-info', /Store Info/i],
      ['/admin/quick-order', /Quick Order/i],
    ]) {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('can create a category', async ({ page }) => {
    await page.goto('/admin/categories');
    const name = `TestCat_${Date.now()}`;
    // Click the "+ Category" button at top-right
    await page.getByRole('button', { name: /Add Category/i }).click();
    // Modal opens — fill Category Name
    await page.getByLabel(/Category Name/i).fill(name);
    // Submit
    await page.getByRole('button', { name: /Create Category|Update Category/i }).click();
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 });
  });

  test('store info page loads with branding section', async ({ page }) => {
    await page.goto('/admin/store-info');
    await expect(page.getByRole('heading', { name: /Store Info/i })).toBeVisible();
    await expect(page.getByText(/Branding/i).first()).toBeVisible();
    await expect(page.getByLabel(/Store Name/i)).toBeVisible();
  });
});
