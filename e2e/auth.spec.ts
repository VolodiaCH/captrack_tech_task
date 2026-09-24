import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Auth Flow', () => {
  test('login redirects to dashboard', async ({ page }) => {
    await loginAsTestUser(page);
    expect(page.url()).toContain('/dashboard');
  });

  test('protected route redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    expect(page.url()).toContain('/login');
  });

  test('logout clears session', async ({ page }) => {
    await loginAsTestUser(page);
    expect(page.url()).toContain('/dashboard');

    // Click logout button (in header)
    await page.click('button:has-text("Logout")');
    await page.waitForURL('**/login', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/login');
  });
});
