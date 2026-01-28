/**
 * E2E Tests: API Key Tier Restrictions
 *
 * Tests that API keys are only available for Business tier
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { APIKeysPage } from '../../pages/dashboard/api-keys.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('API Key Tier Restrictions', () => {
  test('should block free tier users from accessing API keys', async ({ page }) => {
    // Register free tier user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock free tier
    await page.route(`${API_BASE}/user/usage`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          tier: 'free',
          usage_limit: 50,
        }),
      });
    });

    // Try to access API keys page
    const apiKeysPage = new APIKeysPage(page);
    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Upgrade prompt visible
    await apiKeysPage.expectUpgradePrompt();
  });

  test('should disable create button for non-business users', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock free tier
    await page.route(`${API_BASE}/user/usage`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ tier: 'free' }),
      });
    });

    const apiKeysPage = new APIKeysPage(page);
    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Create button disabled
    await apiKeysPage.expectCreateDisabled();
  });

  test('should allow business tier users full access', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock business tier
    await page.route(`${API_BASE}/user/usage`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ tier: 'business', usage_limit: 10000 }),
      });
    });

    // Mock API keys list
    await page.route(`${API_BASE}/api-keys`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ api_keys: [] }),
        });
      }
    });

    const apiKeysPage = new APIKeysPage(page);
    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Page loaded, no upgrade prompt
    await apiKeysPage.expectPageLoaded();

    const upgradePrompt = page.locator('.upgrade-prompt');
    const hasPrompt = await upgradePrompt.isVisible().catch(() => false);
    expect(hasPrompt).toBeFalsy();
  });

  test('should show tier requirement message', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    await page.route(`${API_BASE}/user/usage`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ tier: 'starter' }),
      });
    });

    const apiKeysPage = new APIKeysPage(page);
    await apiKeysPage.goto();
    await page.waitForTimeout(1000);

    // Assert: Business tier requirement message
    const message = page.locator('text=Business tier, text=upgrade to business');
    await expect(message.first()).toBeVisible({ timeout: 5000 });
  });
});
