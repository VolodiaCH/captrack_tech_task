import { Page } from '@playwright/test';

export async function loginAsTestUser(page: Page, provider = 'GOOGLE') {
  await page.request.post('http://localhost:3001/api/test/login', {
    data: {
      provider,
      providerUserId: `test-user-${provider.toLowerCase()}`,
      email: `test${Date.now()}@example.com`,
      displayName: 'Test User',
    },
  });

  // Reload page to authenticate with the new session
  await page.goto('/');
  await page.waitForURL('**/dashboard', { waitUntil: 'networkidle' });
}
