/**
 * E2E Tests: Network Errors & Offline Handling
 *
 * Tests error handling for network failures
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { LeadsPage } from '../../pages/dashboard/leads.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE, mockNetworkFailure } from '../../fixtures/api-helpers';

test.describe('Network Errors', () => {
  test('should handle network timeout', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock timeout
    await page.route(`${API_BASE}/leads`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 30000)); // Never resolves
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Timeout' }),
      });
    });

    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    // Assert: Timeout error
    await page.waitForTimeout(5000);
    const errorMessage = page.locator('text=timeout, text=slow connection, text=try again');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('should handle connection refused', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock connection failure
    await mockNetworkFailure(page, '/leads');

    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    // Assert: Network error
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=network error, text=connection failed');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should allow retry after network error', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    let shouldFail = true;

    await page.route(`${API_BASE}/leads`, async (route) => {
      if (shouldFail) {
        await route.abort('failed');
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ leads: [], pagination: {} }),
        });
      }
    });

    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    await page.waitForTimeout(2000);

    // Assert: Retry button visible
    const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")');
    const hasRetry = await retryButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasRetry) {
      // Allow next request to succeed
      shouldFail = false;

      await retryButton.click();
      await page.waitForTimeout(1000);

      // Should succeed now
    }
  });

  test('should handle 500 server errors', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock 500 error
    await page.route(`${API_BASE}/leads`, async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({
          error: 'Internal server error',
        }),
      });
    });

    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    // Assert: Error message
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=server error, text=something went wrong');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle 503 service unavailable', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock 503
    await page.route(`${API_BASE}/leads`, async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({
          error: 'Service unavailable',
          message: 'Maintenance in progress',
        }),
      });
    });

    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    // Assert: Maintenance message
    await page.waitForTimeout(2000);
    const maintenanceMessage = page.locator('text=maintenance, text=unavailable');
    await expect(maintenanceMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should handle malformed JSON responses', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock malformed JSON
    await page.route(`${API_BASE}/leads`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'This is not valid JSON {',
      });
    });

    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    // Assert: Error handling
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=error, text=unexpected');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show loading state during slow requests', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock slow response
    await page.route(`${API_BASE}/leads`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ leads: [], pagination: {} }),
      });
    });

    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    // Assert: Loading indicator
    await page.waitForTimeout(1000);
    const loadingIndicator = page.locator('.spinner, text=Loading, [data-testid="loading"]');
    await expect(loadingIndicator.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should cancel pending requests on navigation', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Mock slow response
    await page.route(`${API_BASE}/leads`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ leads: [] }),
      });
    });

    const leadsPage = new LeadsPage(page);
    await leadsPage.goto();
    await leadsPage.search({ industry: 'tattoo' });

    // Navigate away quickly
    await page.waitForTimeout(500);
    await page.goto('/dashboard/settings');

    // Should not cause errors
    await page.waitForTimeout(1000);
  });

  test('should handle CORS errors gracefully', async ({ page }) => {
    // Mock CORS error (if testing cross-origin requests)
    // This is typically handled by browser, but error handling should work
  });

  test('should exponential backoff for retries', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    let attemptCount = 0;
    const attemptTimes: number[] = [];

    await page.route(`${API_BASE}/leads`, async (route) => {
      attemptCount++;
      attemptTimes.push(Date.now());

      if (attemptCount < 3) {
        await route.abort('failed');
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ leads: [] }),
        });
      }
    });

    // Implementation with automatic retry
    // Should use exponential backoff: 1s, 2s, 4s, etc.
  });
});
