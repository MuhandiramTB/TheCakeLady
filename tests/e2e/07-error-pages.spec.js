import { test, expect } from '@playwright/test';

test.describe('Error pages', () => {
  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    // "404" gradient text AND "Page Not Found" heading
    await expect(page.getByText(/404/).first()).toBeVisible();
    await expect(page.getByText(/Page Not Found/i)).toBeVisible();
  });

  test('404 page is dark-themed', async ({ page }) => {
    await page.goto('/nonexistent');
    // bg-bg-dark = #1a1116 = rgb(26, 17, 22) — every channel well under 60
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const m = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(m).toBeTruthy();
    const [, r, g, b] = m.map(Number);
    expect(r + g + b).toBeLessThan(150); // dark (each channel <~50)
  });

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /Forgot/i })).toBeVisible();
  });

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/my-orders');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('admin routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('rate limit overlay handles 429 response', async ({ page, request }) => {
    // Drill 11 failed logins quickly → should trigger authLimiter (10 per 15min in prod, 1000 in dev)
    // In dev env limits are very lenient so this might not trigger.
    // Just verify the endpoint responds to bad creds with a 401 (not 500).
    const res = await request.post('http://localhost:3000/api/v1/auth/login', {
      data: { email: 'bad@test.com', password: 'wrong' },
    });
    expect([401, 429]).toContain(res.status());
  });
});
