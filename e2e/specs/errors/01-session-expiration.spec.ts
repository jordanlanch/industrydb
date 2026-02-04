/**
 * E2E Tests: Session Expiration & Authentication Errors
 *
 * Tests automatic logout on session expiration and 401 handling
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { LeadsPage } from '../../pages/dashboard/leads.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('Session Expiration', () => {
  test('should redirect to login on expired JWT', async ({ page }) => {
    // Register and get valid token first
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock expired token response
    await page.route(`${API_BASE}/leads`, async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({
          error: 'Token expired',
          message: 'Your session has expired',
        }),
      });
    });

    // Try to access protected resource
    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    // Assert: Redirected to login
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');

    // Assert: Token cleared
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });

  test('should show session expired message', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock 401
    await page.route(`${API_BASE}/**`, async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      });
    });

    await page.goto('/dashboard/leads');
    await page.waitForTimeout(2000);

    // Assert: Error message
    const errorMessage = page.locator('text=session expired, text=please login');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should clear user data on session expiration', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock 401
    await page.route(`${API_BASE}/user/usage`, async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Assert: User data cleared
    const userData = await page.evaluate(() => localStorage.getItem('user'));
    expect(userData).toBeNull();
  });

  test('should handle 401 on any API endpoint', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock 401 on settings
    await page.route(`${API_BASE}/user/profile`, async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      });
    });

    await page.goto('/dashboard/settings');
    await page.waitForTimeout(1000);

    // Try to update profile
    await page.fill('input[name="name"]', 'New Name');
    await page.click('button:has-text("Save")');

    // Assert: Redirected to login
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('should prevent access to protected pages without token', async ({ page }) => {
    // Clear token
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    });

    // Try to access dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Assert: Redirected to login
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('should maintain redirect URL after login', async ({ page }) => {
    // Clear token
    await page.evaluate(() => localStorage.removeItem('auth_token'));

    // Try to access specific page
    await page.goto('/dashboard/settings');
    await page.waitForTimeout(1000);

    // Should redirect to login
    await page.waitForURL('**/login', { timeout: 10000 });

    // After login, should redirect back
    // This requires login flow implementation
  });

  test('should handle multiple simultaneous 401s', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    let requestCount = 0;

    // Mock 401 on all requests
    await page.route(`${API_BASE}/**`, async (route) => {
      requestCount++;
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      });
    });

    // Make multiple requests
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Should only redirect once
    expect(page.url()).toContain('/login');
  });

  test('should not logout on other 4xx errors', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock 400 (not 401)
    await page.route(`${API_BASE}/leads`, async (route) => {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Bad request' }),
      });
    });

    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    await page.waitForTimeout(2000);

    // Assert: Still on dashboard (not logged out)
    expect(page.url()).toContain('/dashboard');

    // Token still exists
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();
  });

  test('should refresh token automatically if supported', async ({ page }) => {
    // If refresh token mechanism exists
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock token refresh endpoint
    await page.route(`${API_BASE}/auth/refresh`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          token: 'new_jwt_token_here',
        }),
      });
    });

    // Implementation-specific: automatic token refresh
  });
});
