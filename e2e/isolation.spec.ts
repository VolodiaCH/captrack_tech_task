import { test, expect, chromium } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Cross-User Isolation', () => {
  test('User A data invisible to User B', async ({ page }) => {
    // User A: Create data
    await loginAsTestUser(page, 'GOOGLE');
    await page.goto('/categories');

    // Create category
    const userACatName = `UserA-Cat-${Date.now()}`;
    await page.click('button:has-text("+ New Category")');
    await page.fill('input[placeholder*="name" i]', userACatName);
    await page.click('button:has-text("Create")');
    await page.waitForSelector(`text="${userACatName}"`);

    // Go to transactions
    await page.goto('/transactions');
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'UserA Transaction');
    await page.fill('input[placeholder*="amount" i]', '100');
    await page.click('button:has-text("Create")');
    await page.waitForSelector('text="UserA Transaction"');

    // Logout
    await page.click('button:has-text("Logout")');
    await page.waitForURL('**/login');

    // User B: Verify isolation
    await loginAsTestUser(page, 'GITHUB');

    // Check categories - should NOT see User A's category
    await page.goto('/categories');
    await expect(page.locator(`text="${userACatName}"`)).not.toBeTruthy();

    // Check transactions - should NOT see User A's transaction
    await page.goto('/transactions');
    await expect(page.locator('text="UserA Transaction"')).not.toBeTruthy();

    // User B can create their own data without seeing User A's
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'UserB Transaction');
    await page.fill('input[placeholder*="amount" i]', '50');
    await page.click('button:has-text("Create")');
    await page.waitForSelector('text="UserB Transaction"');

    // Verify only UserB data visible
    expect(page.locator('text="UserB Transaction"')).toBeTruthy();
    expect(page.locator('text="UserA Transaction"')).not.toBeTruthy();
  });
});
