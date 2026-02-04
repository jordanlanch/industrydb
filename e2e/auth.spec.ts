import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Industry-Specific Business Data');
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).first().click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Get Started' }).first().click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
  });

  test('should register new user', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.goto('/register');

    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', 'password123');

    await page.getByRole('button', { name: 'Create account' }).click();

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="email"]', 'invalid@example.com');
    await page.fill('input[id="password"]', 'wrongpassword');

    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', 'test@example.com');
    await page.fill('input[id="password"]', 'short');

    await page.getByRole('button', { name: 'Create account' }).click();

    // Should show validation error
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Authenticated User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register a new user before each test
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.goto('/register');
    await page.fill('input[id="name"]', 'E2E Test User');
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', 'password123');
    await page.getByRole('button', { name: 'Create account' }).click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should access dashboard after login', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard/leads');
    await expect(page.locator('text=IndustryDB')).toBeVisible();
    await expect(page.locator('text=Search Leads')).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    await expect(page.locator('text=Leads')).toBeVisible();
    await expect(page.locator('text=Exports')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should navigate to exports page', async ({ page }) => {
    await page.click('text=Exports');
    await expect(page).toHaveURL('/dashboard/exports');
    await expect(page.locator('text=Exports')).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.click('text=Settings');
    await expect(page).toHaveURL('/dashboard/settings');
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Billing & Subscription')).toBeVisible();
  });

  test('should logout user', async ({ page }) => {
    await page.click('text=Logout');
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
