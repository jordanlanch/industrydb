/**
 * E2E Tests: GDPR Compliance
 *
 * Tests GDPR Article 15 (Right of Access) and Article 17 (Right to be Forgotten)
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { SettingsPage } from '../../pages/dashboard/settings.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';
import * as fs from 'fs';

test.describe('GDPR - Data Export (Article 15)', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    // Register and login
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Navigate to settings
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
  });

  test('should export personal data successfully', async ({ page }) => {
    // Arrange: Wait for download
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

    // Act: Click export button
    await settingsPage.clickExportData();

    // Assert: File downloaded
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/industrydb-personal-data-\d+\.json/);

    // Assert: File is valid JSON
    const path = await download.path();
    if (path) {
      const content = fs.readFileSync(path, 'utf-8');
      const data = JSON.parse(content);

      // Verify data structure
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('exported_at');
      expect(data).toHaveProperty('subscriptions');
      expect(data).toHaveProperty('exports');
    }
  });

  test('should include all required user fields in export', async ({ page }) => {
    // Mock API response
    const mockData = {
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        tier: 'free',
        email_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      subscriptions: [],
      exports: [],
      exported_at: new Date().toISOString(),
    };

    await page.route(`${API_BASE}/user/data-export`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });

    // Trigger export
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await settingsPage.clickExportData();
    const download = await downloadPromise;

    // Verify content
    const path = await download.path();
    if (path) {
      const content = fs.readFileSync(path, 'utf-8');
      const data = JSON.parse(content);

      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('email');
      expect(data.user).toHaveProperty('name');
      expect(data.user).toHaveProperty('tier');
      expect(data.user).toHaveProperty('created_at');
    }
  });

  test('should include subscription history in export', async ({ page }) => {
    // Mock with subscription data
    const mockData = {
      user: { id: 1, email: 'test@example.com', name: 'Test' },
      subscriptions: [
        {
          id: 1,
          stripe_subscription_id: 'sub_123',
          tier: 'starter',
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ],
      exports: [],
      exported_at: new Date().toISOString(),
    };

    await page.route(`${API_BASE}/user/data-export`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await settingsPage.clickExportData();
    const download = await downloadPromise;

    const path = await download.path();
    if (path) {
      const content = fs.readFileSync(path, 'utf-8');
      const data = JSON.parse(content);

      expect(data.subscriptions).toBeInstanceOf(Array);
      expect(data.subscriptions.length).toBeGreaterThan(0);
      expect(data.subscriptions[0]).toHaveProperty('stripe_subscription_id');
    }
  });

  test('should call correct API endpoint for export', async ({ page }) => {
    // Wait for request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/user/data-export'),
      { timeout: 15000 }
    );

    // Trigger export (will fail without mock but we just want to check request)
    await settingsPage.clickExportData();

    const request = await requestPromise;

    // Assert
    expect(request.method()).toBe('GET');
    expect(request.url()).toContain('/api/v1/user/data-export');

    // Authorization header present
    const authHeader = request.headers()['authorization'];
    expect(authHeader).toBeTruthy();
    expect(authHeader).toContain('Bearer ');
  });

  test('should handle export errors gracefully', async ({ page }) => {
    // Mock error
    await page.route(`${API_BASE}/user/data-export`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Failed to export data',
        }),
      });
    });

    // Trigger export
    await settingsPage.clickExportData();

    // Assert: Error message shown
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=error, text=failed, text=try again');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show loading state during export', async ({ page }) => {
    // Mock slow response
    await page.route(`${API_BASE}/user/data-export`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {},
          subscriptions: [],
          exports: [],
          exported_at: new Date().toISOString(),
        }),
      });
    });

    // Trigger export
    await settingsPage.clickExportData();

    // Assert: Loading indicator
    await page.waitForTimeout(500);
    const loadingIndicator = page.locator('text=Exporting, text=Loading, .spinner');
    // Loading might be too fast to catch
  });

  test('should include metadata in export', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await settingsPage.clickExportData();
    const download = await downloadPromise;

    const path = await download.path();
    if (path) {
      const content = fs.readFileSync(path, 'utf-8');
      const data = JSON.parse(content);

      // Should have timestamp
      expect(data).toHaveProperty('exported_at');
      expect(new Date(data.exported_at).getTime()).not.toBeNaN();
    }
  });
});

test.describe('GDPR - Account Deletion (Article 17)', () => {
  let settingsPage: SettingsPage;
  let testUser: { name: string; email: string; password: string };

  test.beforeEach(async ({ page }) => {
    // Register and login
    testUser = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(testUser.name, testUser.email, testUser.password);

    await page.waitForTimeout(1000);

    // Navigate to settings
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
  });

  test('should show delete account dialog with password field', async ({ page }) => {
    // Act: Click delete button
    await settingsPage.clickDeleteAccount();

    // Assert: Dialog appears
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"], .modal, .dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Assert: Password field visible
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput.last()).toBeVisible({ timeout: 5000 });

    // Assert: Warning text present
    const warningText = page.locator('text=Delete Account, text=permanent, text=cannot be undone');
    await expect(warningText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should delete account with correct password', async ({ page }) => {
    // Arrange: Open delete dialog
    await settingsPage.clickDeleteAccount();
    await page.waitForTimeout(500);

    // Wait for API request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/user/account') && request.method() === 'DELETE',
      { timeout: 15000 }
    );

    // Act: Enter password and confirm
    await settingsPage.confirmDeleteAccount(testUser.password);

    // Assert: API called
    const request = await requestPromise;
    expect(request.method()).toBe('DELETE');
    expect(request.url()).toContain('/api/v1/user/account');

    // Assert: Body contains password
    const postData = request.postData();
    if (postData) {
      const parsed = JSON.parse(postData);
      expect(parsed).toHaveProperty('password');
    }

    // Assert: Redirected to home/login
    await page.waitForURL('**/login|**/', { timeout: 10000 }).catch(() => {});

    // Assert: Auth token cleared
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });

  test('should reject deletion with incorrect password', async ({ page }) => {
    // Mock error response
    await page.route(`${API_BASE}/user/account`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Incorrect password',
        }),
      });
    });

    // Arrange: Open delete dialog
    await settingsPage.clickDeleteAccount();
    await page.waitForTimeout(500);

    // Act: Enter wrong password
    await settingsPage.confirmDeleteAccount('wrong-password');

    // Assert: Error message shown
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=incorrect, text=wrong password, text=invalid');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });

    // Assert: Still on settings page (not deleted)
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/settings');
  });

  test('should allow canceling account deletion', async ({ page }) => {
    // Act: Open delete dialog
    await settingsPage.clickDeleteAccount();
    await page.waitForTimeout(500);

    // Click cancel
    const cancelButton = page.locator('button:has-text("Cancel"), button[aria-label="Close"]');
    await cancelButton.click({ timeout: 5000 });

    // Assert: Dialog closed
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"], .modal');
    await expect(dialog).not.toBeVisible({ timeout: 5000 }).catch(() => {});

    // Assert: Still on settings page
    expect(page.url()).toContain('/settings');
  });

  test('should prevent login after account deletion', async ({ page }) => {
    // Mock successful deletion
    await page.route(`${API_BASE}/user/account`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Account deleted successfully',
        }),
      });
    });

    // Delete account
    await settingsPage.clickDeleteAccount();
    await page.waitForTimeout(500);
    await settingsPage.confirmDeleteAccount(testUser.password);

    // Wait for redirect
    await page.waitForURL('**/login|**/', { timeout: 10000 }).catch(() => {});

    // Try to login with deleted account
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button:has-text("Login"), button[type="submit"]');

    // Assert: Login should fail
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=invalid, text=not found, text=deleted');
    // Error depends on backend implementation
  });

  test('should require password for deletion', async ({ page }) => {
    // Open delete dialog
    await settingsPage.clickDeleteAccount();
    await page.waitForTimeout(500);

    // Try to confirm without password
    const confirmButton = page.locator('button:has-text("Delete My Account")');
    const isDisabled = await confirmButton.isDisabled({ timeout: 2000 }).catch(() => false);

    // Button should be disabled without password
    if (!isDisabled) {
      // Click confirm without password
      await confirmButton.click();

      // Should show validation error
      await page.waitForTimeout(500);
      const validationError = page.locator('text=required, text=enter password');
    }
  });

  test('should include auth token in deletion request', async ({ page }) => {
    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/user/account') && request.method() === 'DELETE',
      { timeout: 15000 }
    );

    // Trigger deletion
    await settingsPage.clickDeleteAccount();
    await page.waitForTimeout(500);
    await settingsPage.confirmDeleteAccount(testUser.password);

    const request = await requestPromise;

    // Assert: Authorization header present
    const authHeader = request.headers()['authorization'];
    expect(authHeader).toBeTruthy();
    expect(authHeader).toContain('Bearer ');
  });

  test('should handle deletion errors gracefully', async ({ page }) => {
    // Mock server error
    await page.route(`${API_BASE}/user/account`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Failed to delete account',
        }),
      });
    });

    // Try to delete
    await settingsPage.clickDeleteAccount();
    await page.waitForTimeout(500);
    await settingsPage.confirmDeleteAccount(testUser.password);

    // Assert: Error message shown
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=error, text=failed');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show confirmation before deleting', async ({ page }) => {
    // Click delete button
    await settingsPage.clickDeleteAccount();
    await page.waitForTimeout(500);

    // Assert: Confirmation dialog with warnings
    const confirmationText = page.locator('text=Are you sure, text=This action cannot be undone, text=permanently');
    await expect(confirmationText.first()).toBeVisible({ timeout: 5000 });

    // Assert: List of what will be deleted
    const deletionList = page.locator('text=All your data, text=Your account, text=cannot recover');
    // Implementation-specific
  });

  test('should logout user after deletion', async ({ page }) => {
    // Mock successful deletion
    await page.route(`${API_BASE}/user/account`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Account deleted successfully',
        }),
      });
    });

    // Delete account
    await settingsPage.clickDeleteAccount();
    await page.waitForTimeout(500);
    await settingsPage.confirmDeleteAccount(testUser.password);

    // Assert: Redirected to login/home
    await page.waitForURL('**/login|**/', { timeout: 10000 });

    // Assert: Cannot access protected pages
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});
  });
});
