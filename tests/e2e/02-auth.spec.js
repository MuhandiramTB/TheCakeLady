import { test, expect } from '@playwright/test';
import { ADMIN, uniqueEmail, uniquePhone } from './helpers.js';

test.describe('Authentication', () => {
  test('login page renders with forgot password link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/Sign in to your account/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^Sign In$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Forgot password/i })).toBeVisible();
  });

  test('register page renders', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText(/Create your account/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
  });

  test('admin can log in and lands on dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', ADMIN.email);
    await page.fill('input[name="password"]', ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'nouser@test.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid|incorrect|not found|401/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('customer can register and lands on home', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="email"]', uniqueEmail());
    await page.fill('input[name="phone"]', uniquePhone());
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    // Customer is now logged in — navbar should show their profile initial, not "Sign In"
    await expect(page.getByRole('link', { name: /Sign In/i })).not.toBeVisible();
  });

  test('password eye toggle is visible on login', async ({ page }) => {
    await page.goto('/login');
    const toggle = page.getByRole('button', { name: /show password|hide password/i });
    await expect(toggle).toBeVisible();
  });
});
