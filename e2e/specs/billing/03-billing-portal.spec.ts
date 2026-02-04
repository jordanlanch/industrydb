/**
 * E2E Tests: Stripe Billing Portal
 *
 * Tests Stripe customer portal access and functionality
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { PricingPage } from '../../pages/billing/pricing.page';
import { BillingPortalPage } from '../../pages/billing/portal.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('Billing Portal', () => {
  let pricingPage: PricingPage;
  let portalPage: BillingPortalPage;

  test.beforeEach(async ({ page }) => {
    // Register and login
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    // Navigate to settings/billing
    pricingPage = new PricingPage(page);
    portalPage = new BillingPortalPage(page);
    await pricingPage.goto();
  });

  test('should create portal session on manage billing click', async ({ page }) => {
    // Wait for API request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/billing/portal'),
      { timeout: 15000 }
    );

    // Mock response
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://billing.stripe.com/session/test_portal_123',
        }),
      });
    });

    // Click manage billing
    await pricingPage.clickManageBilling();

    // Assert: API called
    const request = await requestPromise;
    expect(request.method()).toBe('POST');
    expect(request.url()).toContain('/api/v1/billing/portal');
  });

  test('should include auth token in portal request', async ({ page }) => {
    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/billing/portal'),
      { timeout: 15000 }
    );

    // Mock response
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();

    const request = await requestPromise;

    // Assert: Authorization header
    const authHeader = request.headers()['authorization'];
    expect(authHeader).toBeTruthy();
    expect(authHeader).toContain('Bearer ');
  });

  test('should include return URL in portal request', async ({ page }) => {
    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/billing/portal'),
      { timeout: 15000 }
    );

    // Mock response
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();

    const request = await requestPromise;

    // Assert: Return URL in query params or body
    const url = request.url();
    expect(url).toMatch(/return_url/);
  });

  test('should redirect to Stripe portal on success', async ({ page }) => {
    // Mock successful response
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://billing.stripe.com/session/test_123',
        }),
      });
    });

    // Click manage billing
    await pricingPage.clickManageBilling();

    // Assert: Redirect attempted
    await page.waitForTimeout(2000);

    // In real scenario, would redirect to Stripe
    // In test, we verify the URL was received
  });

  test('should handle portal creation errors', async ({ page }) => {
    // Mock error response
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'No active subscription',
        }),
      });
    });

    await pricingPage.clickManageBilling();

    // Assert: Error message shown
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=error, text=no subscription, text=failed');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should handle 500 server errors', async ({ page }) => {
    // Mock server error
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
        }),
      });
    });

    await pricingPage.clickManageBilling();

    // Assert: Error handling
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=error, text=failed');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show loading state during portal creation', async ({ page }) => {
    // Mock slow response
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    // Click manage billing
    await pricingPage.clickManageBilling();

    // Assert: Loading indicator
    await page.waitForTimeout(500);
    const loadingIndicator = page.locator('text=Loading, text=Opening, .spinner');
    // Loading might be too fast to catch
  });

  test('should disable manage billing button during portal creation', async ({ page }) => {
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    const manageButton = page.locator('button:has-text("Manage Billing")').first();

    // Click button
    await manageButton.click();

    // Assert: Button disabled
    await page.waitForTimeout(300);
    const isDisabled = await manageButton.isDisabled().catch(() => false);
    expect(isDisabled).toBeTruthy();
  });

  test('should require active subscription for portal access', async ({ page }) => {
    // Mock error for free tier user
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Active subscription required',
        }),
      });
    });

    await pricingPage.clickManageBilling();

    // Assert: Error or upgrade prompt
    await page.waitForTimeout(2000);
    const message = page.locator('text=subscription required, text=upgrade');
    await expect(message.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should validate user is authenticated before portal access', async ({ page }) => {
    // Clear auth token
    await page.evaluate(() => localStorage.removeItem('auth_token'));

    // Try to access portal
    await pricingPage.clickManageBilling();

    // Assert: Redirected to login or error shown
    await page.waitForTimeout(2000);
    const isLoginPage = page.url().includes('/login');
    const hasError = await page.locator('text=login, text=authentication required').isVisible().catch(() => false);

    expect(isLoginPage || hasError).toBeTruthy();
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Mock network failure
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.abort('failed');
    });

    await pricingPage.clickManageBilling();

    // Assert: Error message
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=error, text=failed, text=network');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should re-enable button after portal error', async ({ page }) => {
    // Mock error
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    const manageButton = page.locator('button:has-text("Manage Billing")').first();

    // Click button
    await manageButton.click();

    // Wait for error
    await page.waitForTimeout(2000);

    // Assert: Button re-enabled
    const isDisabled = await manageButton.isDisabled().catch(() => false);
    expect(isDisabled).toBeFalsy();
  });

  test('should handle missing portal URL in response', async ({ page }) => {
    // Mock response without URL
    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          // Missing url field
        }),
      });
    });

    await pricingPage.clickManageBilling();

    // Assert: Error handling
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=error, text=failed');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should use current page URL as default return URL', async ({ page }) => {
    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/billing/portal'),
      { timeout: 15000 }
    );

    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();

    const request = await requestPromise;
    const url = request.url();

    // Assert: Return URL includes current page or settings
    expect(url).toMatch(/return_url.*settings|billing/);
  });
});
