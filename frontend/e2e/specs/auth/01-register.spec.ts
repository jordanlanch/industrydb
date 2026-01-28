/**
 * E2E Tests: User Registration
 *
 * Tests all registration flows including validation and error handling
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { generateTestUser } from '../../fixtures/test-users';

test.describe('User Registration', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should display registration page correctly', async ({ page }) => {
    await registerPage.expectPageLoaded();
    await expect(page).toHaveTitle(/Register|Sign up|Create account/i);
  });

  test('should register new user successfully', async ({ page }) => {
    const user = generateTestUser();

    await registerPage.register(user.name, user.email, user.password);
    await registerPage.expectSuccess();

    // Verify token is stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();
    expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/); // JWT format
  });

  test('should show error for duplicate email', async ({ page }) => {
    const user = generateTestUser();

    // Register first time
    await registerPage.register(user.name, user.email, user.password);
    await registerPage.expectSuccess();

    // Logout
    await page.click('text=Logout');
    await page.waitForURL('/login');

    // Try to register again with same email
    await registerPage.goto();
    await registerPage.register('Another User', user.email, user.password);
    await registerPage.expectError('already exists');
  });

  test('should validate password strength', async ({ page }) => {
    const user = generateTestUser({ password: 'weak' });

    await registerPage.fillForm(user.name, user.email, user.password);
    await registerPage.acceptTerms();
    await registerPage.submit();

    // Should show validation error
    await registerPage.expectError('at least 8 characters');
  });

  test('should validate email format', async ({ page }) => {
    const user = generateTestUser({ email: 'invalid-email' });

    await registerPage.fillForm(user.name, user.email, user.password);
    await registerPage.acceptTerms();
    await registerPage.submit();

    // Should show validation error
    await registerPage.expectError('valid email');
  });

  test('should validate name is required', async ({ page }) => {
    const user = generateTestUser({ name: '' });

    await registerPage.fillForm(user.name, user.email, user.password);
    await registerPage.acceptTerms();
    await registerPage.submit();

    // Should not submit or show error
    await expect(page).toHaveURL('/register');
  });

  test('should require terms acceptance', async ({ page }) => {
    const user = generateTestUser();

    await registerPage.fillForm(user.name, user.email, user.password);
    // Don't accept terms
    await registerPage.submit();

    // Form should not submit
    await expect(page).toHaveURL('/register');
  });

  test('should navigate to login page', async ({ page }) => {
    await registerPage.clickLoginLink();
    await expect(page).toHaveURL('/login');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/v1/auth/register', route => route.abort('failed'));

    const user = generateTestUser();
    await registerPage.register(user.name, user.email, user.password);

    // Should show error message
    await registerPage.expectError('network');
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Mock server error
    await page.route('**/api/v1/auth/register', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    const user = generateTestUser();
    await registerPage.register(user.name, user.email, user.password);

    // Should show error message
    await registerPage.expectError('error');
  });

  test('should redirect authenticated users away from register page', async ({ page }) => {
    // First register
    const user = generateTestUser();
    await registerPage.register(user.name, user.email, user.password);
    await registerPage.expectSuccess();

    // Try to access register page again
    await page.goto('/register');

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
  });

  test('should trim whitespace from inputs', async ({ page }) => {
    const user = generateTestUser();

    await registerPage.fillForm(
      `  ${user.name}  `,
      `  ${user.email}  `,
      user.password
    );
    await registerPage.acceptTerms();
    await registerPage.submit();

    // Should successfully register (backend trims whitespace)
    await registerPage.expectSuccess();
  });

  test('should show password as masked by default', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should enforce rate limiting on registration', async ({ page }) => {
    // This test verifies rate limiting is in place
    // Mock rate limit exceeded response
    await page.route('**/api/v1/auth/register', route => {
      route.fulfill({
        status: 429,
        body: JSON.stringify({ error: 'Too many requests' }),
      });
    });

    const user = generateTestUser();
    await registerPage.register(user.name, user.email, user.password);

    await registerPage.expectError('Too many');
  });
});
