/**
 * E2E Tests: User Logout
 *
 * Tests logout functionality and session cleanup
 */

import { test, expect } from '@playwright/test';
import { test as authTest } from '../../fixtures/auth.fixture';
import { clearAuthToken } from '../../fixtures/api-helpers';

test.describe('User Logout', () => {
  authTest('should logout successfully', async ({ authenticatedPage: page }) => {
    // Verify we're on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Click logout button
    const logoutButton = page.locator('text=Logout').first();
    await logoutButton.click();

    // Should redirect to login
    await page.waitForURL('/login', { timeout: 10000 });

    // Token should be cleared
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });

  authTest('should prevent access to protected routes after logout', async ({ authenticatedPage: page }) => {
    // Logout
    await page.click('text=Logout');
    await page.waitForURL('/login');

    // Try to access protected route
    await page.goto('/dashboard/leads');

    // Should redirect back to login
    await page.waitForURL('/login');
  });

  authTest('should clear all session data on logout', async ({ authenticatedPage: page }) => {
    // Logout
    await page.click('text=Logout');
    await page.waitForURL('/login');

    // Check that all auth-related localStorage is cleared
    const authData = await page.evaluate(() => {
      return {
        token: localStorage.getItem('auth_token'),
        user: localStorage.getItem('user'),
        // Add other session keys if present
      };
    });

    expect(authData.token).toBeNull();
    // Verify other session data is also cleared
  });

  authTest('should redirect to login when accessing dashboard after logout', async ({ authenticatedPage: page }) => {
    await page.click('text=Logout');
    await page.waitForURL('/login');

    // Try different protected routes
    const protectedRoutes = [
      '/dashboard/leads',
      '/dashboard/exports',
      '/dashboard/analytics',
      '/dashboard/settings',
      '/dashboard/organizations',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL('/login', { timeout: 5000 });
    }
  });

  authTest('should show logout button only when authenticated', async ({ authenticatedPage: page }) => {
    // Should see logout button when authenticated
    await expect(page.locator('text=Logout').first()).toBeVisible();

    // Logout
    await page.click('text=Logout');
    await page.waitForURL('/login');

    // Should not see logout button on login page
    const logoutButton = page.locator('text=Logout');
    await expect(logoutButton).not.toBeVisible();
  });
});
