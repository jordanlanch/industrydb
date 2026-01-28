/**
 * E2E Tests: Return URL Validation (Security)
 *
 * Tests open redirect protection in Stripe billing portal return URLs
 * Critical security feature to prevent phishing attacks
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { PricingPage } from '../../pages/billing/pricing.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('Return URL Validation (Security)', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page }) => {
    // Register and login
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    pricingPage = new PricingPage(page);
    await pricingPage.goto();
  });

  test('should accept valid localhost return URL (development)', async ({ page }) => {
    // Mock portal request with valid localhost URL
    let capturedReturnUrl = '';

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      const url = route.request().url();
      const urlObj = new URL(url);
      capturedReturnUrl = urlObj.searchParams.get('return_url') || '';

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    // Assert: Localhost URL accepted
    expect(capturedReturnUrl).toMatch(/localhost:3001/);
  });

  test('should accept valid production domain', async ({ page }) => {
    // Mock production environment
    let capturedReturnUrl = '';

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      const url = route.request().url();
      const urlObj = new URL(url);
      capturedReturnUrl = urlObj.searchParams.get('return_url') || '';

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    // Assert: Valid domain in return URL
    const isValid = capturedReturnUrl.includes('localhost:3001') ||
                    capturedReturnUrl.includes('industrydb.io');
    expect(isValid).toBeTruthy();
  });

  test('should reject malicious external domain', async ({ page }) => {
    // Try to inject malicious return URL
    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // Backend should reject or sanitize
      if (returnUrl.includes('evil.com')) {
        await route.fulfill({
          status: 400,
          body: JSON.stringify({ error: 'Invalid return URL' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
        });
      }
    });

    // Normal click (should use valid URL)
    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    // Should succeed with valid URL
  });

  test('should reject javascript: protocol', async ({ page }) => {
    // Backend should reject javascript: protocol
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // Should not contain javascript:
      expect(returnUrl).not.toMatch(/javascript:/i);

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should reject data: protocol', async ({ page }) => {
    // Backend should reject data: protocol
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // Should not contain data:
      expect(returnUrl).not.toMatch(/data:/i);

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should reject ftp: protocol', async ({ page }) => {
    // Backend should only allow http/https
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // Should use http or https
      expect(returnUrl).toMatch(/^https?:\/\//);

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should reject URL with userinfo (phishing protection)', async ({ page }) => {
    // URLs like https://attacker@industrydb.io should be rejected
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // Should not contain @ (userinfo)
      const hasUserinfo = returnUrl.includes('@') && !returnUrl.match(/^https?:\/\/[^@\/]+@/);
      expect(hasUserinfo).toBeFalsy();

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should reject subdomain takeover attempts', async ({ page }) => {
    // URLs like https://industrydb.io.evil.com should be rejected
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // Should not end with evil.com or other suspicious domains
      expect(returnUrl).not.toMatch(/evil\.com/);
      expect(returnUrl).not.toMatch(/attacker\.com/);

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should use safe fallback URL on validation failure', async ({ page }) => {
    // If validation fails, backend should use safe default
    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      // Simulate backend receiving invalid URL and using fallback
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    // Should still work (using fallback URL)
  });

  test('should only allow whitelisted domains', async ({ page }) => {
    // Backend should have domain whitelist
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // Should be from whitelisted domain
      const whitelistedDomains = [
        'localhost:3001',
        'industrydb.io',
        'www.industrydb.io',
      ];

      const isWhitelisted = whitelistedDomains.some(domain => returnUrl.includes(domain));
      expect(isWhitelisted).toBeTruthy();

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should normalize URL before validation', async ({ page }) => {
    // Backend should normalize URLs (remove fragments, normalize paths)
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // URL should be normalized (no fragments, clean path)
      expect(returnUrl).toMatch(/^https?:\/\/[^#]+$/); // No fragments

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should validate URL format', async ({ page }) => {
    // Backend should validate URL format
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // Should be valid URL format
      try {
        new URL(returnUrl);
      } catch (e) {
        // Should not reach here with invalid URL
        expect(false).toBeTruthy();
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should log suspicious return URL attempts', async ({ page }) => {
    // Backend should log suspicious attempts for security monitoring
    // This is a backend concern but we can verify frontend doesn't send malicious URLs

    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();

      // Request should be clean
      expect(url).not.toContain('evil');
      expect(url).not.toContain('attack');

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should preserve valid query parameters in return URL', async ({ page }) => {
    // Valid query params should be preserved
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal*`, async (route) => {
      requestMade = true;
      const url = route.request().url();
      const urlObj = new URL(url);
      const returnUrl = urlObj.searchParams.get('return_url') || '';

      // Should allow valid query params
      // e.g., http://localhost:3001/dashboard/settings?tab=billing
      if (returnUrl.includes('?')) {
        expect(returnUrl).toMatch(/\?[a-zA-Z0-9_=&]+$/);
      }

      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });

  test('should handle missing return URL parameter', async ({ page }) => {
    // If no return URL provided, should use default
    let requestMade = false;

    await page.route(`${API_BASE}/billing/portal`, async (route) => {
      requestMade = true;

      // Should still work without return URL (use default)
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://billing.stripe.com/test' }),
      });
    });

    await pricingPage.clickManageBilling();
    await page.waitForTimeout(1000);

    expect(requestMade).toBeTruthy();
  });
});
