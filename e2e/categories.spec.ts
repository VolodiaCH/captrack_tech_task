import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Category CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/categories');
  });

  test('create category', async ({ page }) => {
    const categoryName = `TestCategory-${Date.now()}`;
    await page.click('button:has-text("+ New Category")');
    await page.fill('input[placeholder*="name" i]', categoryName);
    await page.click('button:has-text("Create")');
    await page.waitForSelector(`text="${categoryName}"`);
    expect(page.locator(`text="${categoryName}"`)).toBeTruthy();
  });

  test('rename category', async ({ page }) => {
    const originalName = `CatA-${Date.now()}`;
    const newName = `CatB-${Date.now()}`;

    // Create a category
    await page.click('button:has-text("+ New Category")');
    await page.fill('input[placeholder*="name" i]', originalName);
    await page.click('button:has-text("Create")');
    await page.waitForSelector(`text="${originalName}"`);

    // Rename it
    await page.click(`text="${originalName}" ~ button`);
    const input = page.locator(`text="${originalName}")`).locator('..').locator('input');
    await input.fill(newName);
    await page.click('button:has-text("Save")');
    await page.waitForSelector(`text="${newName}"`);
    expect(page.locator(`text="${newName}"`)).toBeTruthy();
  });

  test('delete category', async ({ page }) => {
    const categoryName = `DelCat-${Date.now()}`;

    // Create
    await page.click('button:has-text("+ New Category")');
    await page.fill('input[placeholder*="name" i]', categoryName);
    await page.click('button:has-text("Create")');
    await page.waitForSelector(`text="${categoryName}"`);

    // Delete
    await page.click(`text="${categoryName}" ~ button:has-text("Delete")`);
    await page.click('button:has-text("Delete")');
    await page.waitForSelector(`text="${categoryName}"`, { state: 'hidden' });
    expect(page.locator(`text="${categoryName}"`)).not.toBeTruthy();
  });

  test('Uncategorized is protected', async ({ page }) => {
    await expect(page.locator('text="Uncategorized"')).toBeTruthy();
    // Verify no delete button for Uncategorized
    const uncatRow = page.locator('text="Uncategorized"').locator('..');
    await expect(uncatRow.locator('button:has-text("Delete")')).not.toBeTruthy();
  });
});
