/**
 * E2E Tests: User Login
 *
 * Tests all login flows including validation and error handling
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';
import { RegisterPage } from '../../pages/auth/register.page';
import { generateTestUser } from '../../fixtures/test-users';

test.describe('User Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ page }) => {
    await loginPage.expectPageLoaded();
    await expect(page).toHaveTitle(/Login|Sign in/i);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // First register a user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);
    await registerPage.expectSuccess();

    // Logout
    await page.click('text=Logout');
    await page.waitForURL('/login');

    // Login again
    await loginPage.login(user.email, user.password);
    await loginPage.expectSuccess();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.expectError('Invalid');
  });

  test('should show error for empty email', async ({ page }) => {
    await loginPage.fillForm('', 'password123');
    await loginPage.submit();

    // Should not submit or show validation error
    await expect(page).toHaveURL('/login');
  });

  test('should show error for empty password', async ({ page }) => {
    await loginPage.fillForm('test@example.com', '');
    await loginPage.submit();

    // Should not submit or show validation error
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to register page', async ({ page }) => {
    await loginPage.clickRegisterLink();
    await expect(page).toHaveURL('/register');
  });

  test('should redirect authenticated users away from login page', async ({ page }) => {
    // First register and login
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);
    await registerPage.expectSuccess();

    // Try to access login page
    await page.goto('/login');

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 5000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/v1/auth/login', route => route.abort('failed'));

    await loginPage.login('test@example.com', 'password123');

    // Should show error message
    await loginPage.expectError('network');
  });

  test('should enforce rate limiting on login attempts', async ({ page }) => {
    // Mock rate limit exceeded response
    await page.route('**/api/v1/auth/login', route => {
      route.fulfill({
        status: 429,
        body: JSON.stringify({ error: 'Too many login attempts' }),
      });
    });

    await loginPage.login('test@example.com', 'password123');
    await loginPage.expectError('Too many');
  });

  test('should persist session after page reload', async ({ page }) => {
    // Register and login
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);
    await registerPage.expectSuccess();

    // Reload page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should clear auth on logout', async ({ page }) => {
    // Register and login
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);
    await registerPage.expectSuccess();

    // Logout
    await page.click('text=Logout');
    await page.waitForURL('/login');

    // Token should be cleared
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();

    // Try to access protected route
    await page.goto('/dashboard/leads');

    // Should redirect to login
    await page.waitForURL('/login');
  });

  test('should handle expired tokens', async ({ page }) => {
    // Set an expired token
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'expired.token.here');
    });

    // Try to access protected route
    await page.goto('/dashboard/leads');

    // Should redirect to login (401 response)
    await page.waitForURL('/login', { timeout: 10000 });
  });

  test('should trim whitespace from email input', async ({ page }) => {
    // Register user first
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);
    await registerPage.expectSuccess();

    // Logout
    await page.click('text=Logout');
    await page.waitForURL('/login');

    // Login with spaces around email
    await loginPage.login(`  ${user.email}  `, user.password);
    await loginPage.expectSuccess();
  });

  test('should show password as masked by default', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
