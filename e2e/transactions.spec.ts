import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Transaction CRUD and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/transactions');
  });

  test('create transaction', async ({ page }) => {
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'Test Expense');
    await page.fill('input[placeholder*="amount" i]', '50');
    await page.click('button:has-text("Create")');
    await page.waitForSelector('text="Test Expense"');
    expect(page.locator('text="Test Expense"')).toBeTruthy();
  });

  test('delete transaction', async ({ page }) => {
    // Create
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'ToDelete');
    await page.fill('input[placeholder*="amount" i]', '25');
    await page.click('button:has-text("Create")');
    await page.waitForSelector('text="ToDelete"');

    // Delete
    const row = page.locator('text="ToDelete"').locator('..');
    await row.locator('button:has-text("Delete")').click();
    await page.click('button:has-text("Delete")');
    await page.waitForSelector('text="ToDelete"', { state: 'hidden' });
    expect(page.locator('text="ToDelete"')).not.toBeTruthy();
  });

  test('apply search filter', async ({ page }) => {
    // Create a transaction
    await page.click('button:has-text("+ New Transaction")');
    await page.fill('input[placeholder*="title" i]', 'UniqueTitle');
    await page.fill('input[placeholder*="amount" i]', '100');
    await page.click('button:has-text("Create")');
    await page.waitForSelector('text="UniqueTitle"');

    // Apply search
    await page.fill('input[placeholder*="search" i]', 'UniqueTitle');
    await page.waitForURL(/search=UniqueTitle/);
    expect(page.url()).toContain('search=UniqueTitle');
  });

  test('apply category filter', async ({ page }) => {
    await page.click('select');
    await page.selectOption('select', { label: /Uncategorized/ });
    await page.waitForURL(/categoryId=/);
    expect(page.url()).toContain('categoryId=');
  });

  test('apply date range filter', async ({ page }) => {
    await page.click('button:has-text("This Month")');
    await page.waitForURL(/dateRange=thisMonth/);
    expect(page.url()).toContain('dateRange=thisMonth');
  });

  test('apply amount filter', async ({ page }) => {
    await page.fill('input[placeholder*="min" i]', '10');
    await page.fill('input[placeholder*="max" i]', '100');
    await page.click('button:has-text("Apply")');
    await page.waitForURL(/minAmount=10.*maxAmount=100/);
    expect(page.url()).toContain('minAmount=10');
    expect(page.url()).toContain('maxAmount=100');
  });
});
