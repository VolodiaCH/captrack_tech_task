import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Budget Threshold Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard');

    // Create a budget of $100
    await page.click('text="No budget set"');
    await page.fill('input[placeholder*="budget" i]', '100');
    await page.click('button:has-text("Create Budget")');
    await page.waitForSelector('text="100"');
  });

  test('50% threshold alert fires as toast', async ({ page }) => {
    // Go to transactions
    await page.click('a:has-text("Transactions")');
    await page.waitForURL('**/transactions');

    // Add transaction for $50 (50% threshold)
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'Half Budget');
    await page.fill('input[placeholder*="amount" i]', '50');
    await page.click('button:has-text("Create")');

    // Wait for toast notification
    await page.waitForSelector('.toast', { timeout: 5000 });
    const toast = page.locator('.toast').first();
    expect(await toast.textContent()).toContain('50%');
  });

  test('80% threshold alert fires as toast', async ({ page }) => {
    await page.click('a:has-text("Transactions")');
    await page.waitForURL('**/transactions');

    // Add $50
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'First');
    await page.fill('input[placeholder*="amount" i]', '50');
    await page.click('button:has-text("Create")');
    await page.waitForSelector('.toast');

    // Add $30 (80% total)
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'Second');
    await page.fill('input[placeholder*="amount" i]', '30');
    await page.click('button:has-text("Create")');

    await page.waitForSelector('.toast:has-text("80%")', { timeout: 5000 });
    expect(page.locator('.toast:has-text("80%")')).toBeTruthy();
  });

  test('100% threshold alert shows persistent banner', async ({ page }) => {
    await page.click('a:has-text("Transactions")');
    await page.waitForURL('**/transactions');

    // Add $100 transaction
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'Full');
    await page.fill('input[placeholder*="amount" i]', '100');
    await page.click('button:has-text("Create")');

    // Wait for banner (more persistent than toast)
    await page.waitForSelector('.alert-banner', { timeout: 5000 });
    expect(page.locator('.alert-banner')).toBeTruthy();
    expect(await page.locator('.alert-banner').textContent()).toContain('Budget limit reached');
  });

  test('alert persists on reload', async ({ page }) => {
    await page.click('a:has-text("Transactions")');
    await page.waitForURL('**/transactions');

    // Add $100
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'Full');
    await page.fill('input[placeholder*="amount" i]', '100');
    await page.click('button:has-text("Create")');

    await page.waitForSelector('.alert-banner', { timeout: 5000 });

    // Reload
    await page.reload();
    await page.waitForURL('**/transactions');

    // Alert should still be visible
    await page.waitForSelector('.alert-banner', { timeout: 5000 });
    expect(page.locator('.alert-banner')).toBeTruthy();
  });

  test('dismissing alert removes persistent banner', async ({ page }) => {
    await page.click('a:has-text("Transactions")');
    await page.waitForURL('**/transactions');

    // Add $100
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'Full');
    await page.fill('input[placeholder*="amount" i]', '100');
    await page.click('button:has-text("Create")');

    await page.waitForSelector('.alert-banner', { timeout: 5000 });

    // Dismiss
    await page.click('button:has-text("Dismiss")');
    await page.waitForSelector('.alert-banner', { state: 'hidden' });
    expect(page.locator('.alert-banner')).not.toBeTruthy();
  });
});
