/**
 * Authentication fixtures for E2E tests
 *
 * Provides pre-authenticated pages for different user types
 */

import { test as base, Page } from '@playwright/test';
import { testUsers, generateTestUser } from './test-users';

type AuthFixtures = {
  /**
   * Page authenticated as a free tier user
   */
  authenticatedPage: Page;

  /**
   * Page authenticated as a free tier user (alias)
   */
  freeUserPage: Page;

  /**
   * Page authenticated as a business tier user
   * Use this for testing API keys, organizations, etc.
   */
  businessUserPage: Page;

  /**
   * Page authenticated as an admin user
   * Use this for testing admin panel features
   */
  adminUserPage: Page;

  /**
   * Page authenticated as a pro tier user
   */
  proUserPage: Page;

  /**
   * Helper function to login with custom credentials
   */
  loginAs: (page: Page, email: string, password: string) => Promise<void>;
};

/**
 * Helper function to perform login
 */
async function performLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (with generous timeout for slow CI)
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

/**
 * Helper function to register a new user
 */
async function registerNewUser(page: Page): Promise<{ email: string; password: string }> {
  const user = generateTestUser();

  await page.goto('/register');
  await page.fill('input[id="name"]', user.name);
  await page.fill('input[id="email"]', user.email);
  await page.fill('input[id="password"]', user.password);

  // Check terms if checkbox exists
  const termsCheckbox = page.locator('input[id="terms"]');
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });

  return { email: user.email, password: user.password };
}

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  // Free tier user (default authenticated page)
  authenticatedPage: async ({ page }, use) => {
    const user = await registerNewUser(page);
    await use(page);
    // Cleanup: logout after test
    const logoutBtn = page.locator('text=Logout').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
    }
  },

  // Alias for authenticatedPage
  freeUserPage: async ({ page }, use) => {
    const user = await registerNewUser(page);
    await use(page);
    const logoutBtn = page.locator('text=Logout').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
    }
  },

  // Business tier user
  businessUserPage: async ({ page }, use) => {
    // For now, register a new user
    // TODO: In production, create a business tier user via API
    const user = await registerNewUser(page);
    await use(page);
    const logoutBtn = page.locator('text=Logout').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
    }
  },

  // Admin user
  adminUserPage: async ({ page }, use) => {
    // For now, register a new user
    // TODO: In production, create an admin user via API
    const user = await registerNewUser(page);
    await use(page);
    const logoutBtn = page.locator('text=Logout').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
    }
  },

  // Pro tier user
  proUserPage: async ({ page }, use) => {
    // For now, register a new user
    // TODO: In production, create a pro tier user via API
    const user = await registerNewUser(page);
    await use(page);
    const logoutBtn = page.locator('text=Logout').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
    }
  },

  // Helper function fixture
  loginAs: async ({ page }, use) => {
    await use(performLogin);
  },
});

export { expect } from '@playwright/test';
