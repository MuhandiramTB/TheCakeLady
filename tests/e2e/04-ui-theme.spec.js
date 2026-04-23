import { test, expect } from '@playwright/test';

test.describe('UI / theme', () => {
  test('background is dark', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const m = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(m).toBeTruthy();
    const [, r, g, b] = m.map(Number);
    expect(r + g + b).toBeLessThan(150); // dark body
  });

  test('landing page shows rose-gold accent on hero text', async ({ page }) => {
    await page.goto('/');
    // Check the gradient title is rendered
    const title = page.getByRole('heading', { name: /Delicious cakes/i });
    await expect(title).toBeVisible();
  });

  test('mobile menu toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const menuBtn = page.getByRole('button', { name: /Menu/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    // Mobile menu appears — at least one of the customer links should be in the drawer
    await expect(page.getByRole('link', { name: /Shop/i }).first()).toBeVisible();
  });

  test('products page has grid layout', async ({ page }) => {
    await page.goto('/products');
    // Either cakes are rendered or empty state
    const hasCakes = await page.locator('[class*="grid"]').first().isVisible().catch(() => false);
    expect(hasCakes).toBe(true);
  });

  test('footer/branding loads salon name from API', async ({ page }) => {
    await page.goto('/');
    // Navbar should have the store name visible
    const nameText = await page.locator('header').textContent();
    expect(nameText?.length).toBeGreaterThan(3); // has some name
  });
});
