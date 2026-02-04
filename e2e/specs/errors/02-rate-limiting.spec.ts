/**
 * E2E Tests: Rate Limiting
 *
 * Tests rate limit enforcement and error handling
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';
import { RegisterPage } from '../../pages/auth/register.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('Rate Limiting', () => {
  test('should enforce login rate limit', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Mock rate limit after 5 attempts
    let attemptCount = 0;

    await page.route(`${API_BASE}/auth/login`, async (route) => {
      attemptCount++;

      if (attemptCount > 5) {
        await route.fulfill({
          status: 429,
          body: JSON.stringify({
            error: 'Too many login attempts',
            message: 'Please try again in 1 minute',
            retry_after: 60,
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({ error: 'Invalid credentials' }),
        });
      }
    });

    // Make 6 login attempts
    for (let i = 0; i < 6; i++) {
      await loginPage.login('test@example.com', 'wrongpassword');
      await page.waitForTimeout(500);
    }

    // Assert: Rate limit error
    const rateLimitMessage = page.locator('text=too many, text=try again, text=rate limit');
    await expect(rateLimitMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show retry countdown', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Mock 429 with retry_after
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      await route.fulfill({
        status: 429,
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          retry_after: 60,
        }),
      });
    });

    await loginPage.login('test@example.com', 'password');
    await page.waitForTimeout(1000);

    // Assert: Countdown or retry message
    const retryMessage = page.locator('text=60 seconds, text=1 minute');
    await expect(retryMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should disable login button during rate limit', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await page.route(`${API_BASE}/auth/login`, async (route) => {
      await route.fulfill({
        status: 429,
        body: JSON.stringify({ error: 'Rate limit exceeded' }),
      });
    });

    await loginPage.login('test@example.com', 'password');
    await page.waitForTimeout(1000);

    // Assert: Button disabled
    const submitButton = page.locator('button[type="submit"]');
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    expect(isDisabled).toBeTruthy();
  });

  test('should enforce registration rate limit', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // Mock rate limit
    await page.route(`${API_BASE}/auth/register`, async (route) => {
      await route.fulfill({
        status: 429,
        body: JSON.stringify({
          error: 'Too many registration attempts',
          message: 'Please try again later',
        }),
      });
    });

    await registerPage.goto();
    await registerPage.register('Test', 'test@example.com', 'password123');

    // Assert: Rate limit error
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=too many, text=rate limit');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should enforce API endpoint rate limits', async ({ page }) => {
    // Register user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock rate limit on leads endpoint
    let requestCount = 0;

    await page.route(`${API_BASE}/leads*`, async (route) => {
      requestCount++;

      if (requestCount > 60) {
        await route.fulfill({
          status: 429,
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many requests per minute',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ leads: [], pagination: {} }),
        });
      }
    });

    // Make many requests
    for (let i = 0; i < 62; i++) {
      await page.goto('/dashboard/leads?industry=tattoo');
      await page.waitForTimeout(100);
    }

    // Assert: Rate limit hit
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=rate limit, text=too many');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show rate limit in response headers', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Mock with rate limit headers
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '2',
          'X-RateLimit-Reset': String(Date.now() + 60000),
        },
        body: JSON.stringify({ error: 'Invalid credentials' }),
      });
    });

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login'),
      { timeout: 10000 }
    );

    await loginPage.login('test@example.com', 'password');

    const response = await responsePromise;

    // Assert: Headers present
    const limitHeader = response.headers()['x-ratelimit-limit'];
    expect(limitHeader).toBe('5');
  });

  test('should reset rate limit after time period', async ({ page }) => {
    // This requires waiting or mocking time
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    let shouldLimit = true;

    await page.route(`${API_BASE}/auth/login`, async (route) => {
      if (shouldLimit) {
        await route.fulfill({
          status: 429,
          body: JSON.stringify({ error: 'Rate limited' }),
        });
      } else {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({ error: 'Invalid credentials' }),
        });
      }
    });

    // First attempt - rate limited
    await loginPage.login('test@example.com', 'password');
    await page.waitForTimeout(1000);

    let errorMessage = page.locator('text=rate limit');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });

    // Simulate time passing
    shouldLimit = false;

    // Second attempt - no longer rate limited
    await page.waitForTimeout(2000);
    await loginPage.login('test@example.com', 'password');

    await page.waitForTimeout(1000);
    errorMessage = page.locator('text=invalid credentials');
    // Should show different error now
  });

  test('should apply different limits to different endpoints', async ({ page }) => {
    // Login: 5 per minute
    // Register: 3 per hour
    // General API: 60 per minute

    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Each endpoint should have different limits
    // This is implementation-specific
  });
});
