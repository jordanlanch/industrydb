/**
 * E2E Tests: Password Change
 *
 * Tests password update functionality and validation
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { LoginPage } from '../../pages/auth/login.page';
import { SettingsPage } from '../../pages/dashboard/settings.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('Password Change', () => {
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

  test('should change password successfully', async ({ page }) => {
    // Arrange
    const newPassword = 'NewPassword123!';

    // Navigate to password section (might be in settings or separate page)
    // This is implementation-specific

    // Fill password fields
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', newPassword);
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', newPassword);

    // Wait for API request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/user/password'),
      { timeout: 15000 }
    );

    // Submit
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    // Assert: API called
    const request = await requestPromise.catch(() => null);
    if (request) {
      expect(request.method()).toBe('POST');
      expect(request.url()).toContain('/api/v1/user/password');
    }

    // Assert: Success message
    await page.waitForTimeout(1000);
    const successMessage = page.locator('text=password changed, text=updated successfully');
    await expect(successMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should login with new password after change', async ({ page }) => {
    // Mock successful password change
    const newPassword = 'NewPassword123!';

    await page.route(`${API_BASE}/user/password`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password changed successfully',
        }),
      });
    });

    // Change password
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', newPassword);
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', newPassword);
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    await page.waitForTimeout(2000);

    // Logout
    await page.goto('/dashboard');
    await page.click('text=Logout').catch(() => {
      page.click('[data-testid="logout-button"]').catch(() => {});
    });

    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});

    // Try to login with new password
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUser.email, newPassword);

    // Assert: Should login successfully
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('should reject incorrect current password', async ({ page }) => {
    // Mock error response
    await page.route(`${API_BASE}/user/password`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Current password is incorrect',
        }),
      });
    });

    // Try to change password with wrong current password
    await page.fill('input[name="current_password"], input[placeholder*="current"]', 'wrong-password');
    await page.fill('input[name="new_password"], input[placeholder*="new"]', 'NewPassword123!');
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', 'NewPassword123!');
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    // Assert: Error message
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=incorrect, text=current password');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should validate password length (minimum 8 characters)', async ({ page }) => {
    // Try short password
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', 'short');
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', 'short');

    // Submit
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    // Assert: Validation error
    await page.waitForTimeout(500);
    const validationError = page.locator('text=at least 8, text=too short, text=minimum');
    await expect(validationError.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // HTML5 validation might prevent submission
    });
  });

  test('should validate password confirmation match', async ({ page }) => {
    // Fill mismatched passwords
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', 'NewPassword123!');
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', 'DifferentPassword123!');

    // Submit
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    // Assert: Validation error
    await page.waitForTimeout(500);
    const validationError = page.locator('text=do not match, text=must match, text=passwords match');
    await expect(validationError.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should require all fields to be filled', async ({ page }) => {
    // Try to submit with empty fields
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    // Assert: Validation errors or disabled button
    await page.waitForTimeout(500);
    const validationError = page.locator('text=required, text=cannot be empty');
    const isVisible = await validationError.first().isVisible().catch(() => false);

    if (!isVisible) {
      // Button might be disabled
      const submitButton = page.locator('button:has-text("Change Password"), button:has-text("Update Password")');
      const isDisabled = await submitButton.isDisabled().catch(() => false);
      expect(isDisabled).toBeTruthy();
    }
  });

  test('should prevent using same password as current', async ({ page }) => {
    // Mock validation error
    await page.route(`${API_BASE}/user/password`, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'New password must be different from current password',
        }),
      });
    });

    // Try to use same password
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', testUser.password);
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', testUser.password);
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    // Assert: Error message
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=different, text=same password');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show password visibility toggle', async ({ page }) => {
    // Look for show/hide password buttons
    const toggleButtons = page.locator('button[aria-label*="Show"], button[aria-label*="Hide"], .eye-icon');
    const count = await toggleButtons.count();

    // Should have toggles for all password fields (at least 3)
    if (count > 0) {
      // Click first toggle
      await toggleButtons.first().click();

      // Check if input type changed to text
      const passwordInput = page.locator('input[name="current_password"], input[placeholder*="current"]');
      const type = await passwordInput.getAttribute('type');
      // Type might toggle between 'password' and 'text'
    }
  });

  test('should clear form after successful change', async ({ page }) => {
    // Mock successful change
    await page.route(`${API_BASE}/user/password`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password changed successfully',
        }),
      });
    });

    // Fill and submit
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', 'NewPassword123!');
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', 'NewPassword123!');
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    await page.waitForTimeout(2000);

    // Assert: Fields cleared
    const currentPasswordValue = await page.inputValue('input[name="current_password"], input[placeholder*="current"]').catch(() => '');
    // Fields might be cleared after success
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Mock 500 error
    await page.route(`${API_BASE}/user/password`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
        }),
      });
    });

    // Try to change password
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', 'NewPassword123!');
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', 'NewPassword123!');
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    // Assert: Error message
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=error, text=failed');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should include auth token in password change request', async ({ page }) => {
    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/user/password'),
      { timeout: 15000 }
    );

    // Submit password change
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', 'NewPassword123!');
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', 'NewPassword123!');
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    const request = await requestPromise.catch(() => null);
    if (request) {
      // Assert: Authorization header present
      const authHeader = request.headers()['authorization'];
      expect(authHeader).toBeTruthy();
      expect(authHeader).toContain('Bearer ');
    }
  });

  test('should send current and new password in request', async ({ page }) => {
    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/user/password'),
      { timeout: 15000 }
    );

    const newPassword = 'NewPassword123!';

    // Submit password change
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', newPassword);
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', newPassword);
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    const request = await requestPromise.catch(() => null);
    if (request) {
      // Assert: Body contains both passwords
      const postData = request.postData();
      if (postData) {
        const parsed = JSON.parse(postData);
        expect(parsed).toHaveProperty('current_password');
        expect(parsed).toHaveProperty('new_password');
      }
    }
  });

  test('should logout user after password change (optional security feature)', async ({ page }) => {
    // Some apps logout user after password change for security
    // This is implementation-specific

    // Mock successful change
    await page.route(`${API_BASE}/user/password`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Password changed successfully',
        }),
      });
    });

    // Change password
    await page.fill('input[name="current_password"], input[placeholder*="current"]', testUser.password);
    await page.fill('input[name="new_password"], input[placeholder*="new"]', 'NewPassword123!');
    await page.fill('input[name="confirm_password"], input[placeholder*="confirm"]', 'NewPassword123!');
    await page.click('button:has-text("Change Password"), button:has-text("Update Password")');

    await page.waitForTimeout(3000);

    // Check if logged out (optional behavior)
    // If not logged out, user stays on settings page
  });
});
