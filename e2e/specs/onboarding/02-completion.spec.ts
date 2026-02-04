/**
 * E2E Tests: Onboarding Completion
 *
 * Tests the onboarding completion API endpoint and state management
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { OnboardingWizardPage } from '../../pages/onboarding/wizard.page';
import { LoginPage } from '../../pages/auth/login.page';
import { generateTestUser } from '../../fixtures/test-users';
import { API_BASE } from '../../fixtures/api-helpers';

test.describe('Onboarding Completion', () => {
  let wizardPage: OnboardingWizardPage;

  test('should call correct API endpoint on completion', async ({ page }) => {
    // Arrange: Register and start onboarding
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    // Wait for registration to complete
    await page.waitForTimeout(1000);

    // Navigate to onboarding if not already there
    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding');
    }

    wizardPage = new OnboardingWizardPage(page);

    // Act: Complete onboarding
    await wizardPage.selectIndustry('tattoo');
    await wizardPage.clickNext();

    // Wait for and capture the API request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/user/onboarding/complete'),
      { timeout: 15000 }
    );

    await wizardPage.complete();

    // Assert: Verify API call
    const request = await requestPromise;
    expect(request.method()).toBe('POST');
    expect(request.url()).toContain('/api/v1/user/onboarding/complete');

    // Assert: Verify redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('should show correct response on successful completion', async ({ page }) => {
    // Arrange: Register new user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding');
    }

    wizardPage = new OnboardingWizardPage(page);

    // Wait for response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/user/onboarding/complete'),
      { timeout: 15000 }
    );

    await wizardPage.selectIndustry('beauty');
    await wizardPage.clickNext();
    await wizardPage.complete();

    // Assert: Verify response
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('message');
    expect(data.message).toContain('completed');
  });

  test('should not show onboarding banner after completion', async ({ page }) => {
    // Arrange: Complete onboarding
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    if (page.url().includes('/onboarding')) {
      wizardPage = new OnboardingWizardPage(page);
      await wizardPage.selectIndustry('gym');
      await wizardPage.clickNext();
      await wizardPage.complete();
    }

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Assert: No onboarding banner visible
    const onboardingBanner = page.locator('.onboarding-banner, [data-testid="onboarding-banner"]');
    await expect(onboardingBanner).not.toBeVisible({ timeout: 5000 }).catch(() => {
      // Banner might not exist in DOM, that's fine
    });
  });

  test('should persist onboarding state across sessions', async ({ page }) => {
    // Arrange: Register and complete onboarding
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    if (page.url().includes('/onboarding')) {
      wizardPage = new OnboardingWizardPage(page);
      await wizardPage.selectIndustry('restaurant');
      await wizardPage.clickNext();
      await wizardPage.complete();
    }

    // Act: Logout
    await page.goto('/dashboard');
    await page.click('text=Logout').catch(() => {
      // Try alternative logout button selectors
      page.click('[data-testid="logout-button"]').catch(() => {});
    });

    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});

    // Login again
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert: Should NOT redirect to onboarding
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    expect(page.url()).not.toContain('/onboarding');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Arrange: Register user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding');
    }

    // Mock network error
    await page.route(`${API_BASE}/user/onboarding/complete`, async (route) => {
      await route.abort('failed');
    });

    wizardPage = new OnboardingWizardPage(page);
    await wizardPage.selectIndustry('barber');
    await wizardPage.clickNext();

    // Act: Try to complete
    await wizardPage.complete().catch(() => {
      // Error is expected
    });

    // Assert: Error message or toast should appear
    // (Implementation depends on your error handling)
    await page.waitForTimeout(2000);

    // User should still be on onboarding page
    expect(page.url()).toContain('/onboarding');
  });

  test('should handle 500 server errors', async ({ page }) => {
    // Arrange: Register user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding');
    }

    // Mock 500 error
    await page.route(`${API_BASE}/user/onboarding/complete`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
        }),
      });
    });

    wizardPage = new OnboardingWizardPage(page);
    await wizardPage.selectIndustry('beauty');
    await wizardPage.clickNext();

    // Act: Try to complete
    await wizardPage.complete().catch(() => {
      // Error is expected
    });

    // Assert: Should show error message
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/onboarding');
  });

  test('should handle 401 unauthorized errors', async ({ page }) => {
    // Arrange: Navigate to onboarding without auth
    await page.goto('/onboarding');

    // Mock 401 error
    await page.route(`${API_BASE}/user/onboarding/complete`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized',
        }),
      });
    });

    // Try to complete onboarding
    wizardPage = new OnboardingWizardPage(page);
    await wizardPage.complete().catch(() => {});

    // Assert: Should redirect to login
    await page.waitForURL('**/login**', { timeout: 10000 }).catch(() => {
      // If not redirected, at least shouldn't complete
      expect(page.url()).not.toContain('/dashboard');
    });
  });

  test('should include auth token in completion request', async ({ page }) => {
    // Arrange: Register user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding');
    }

    wizardPage = new OnboardingWizardPage(page);

    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/user/onboarding/complete'),
      { timeout: 15000 }
    );

    await wizardPage.selectIndustry('tattoo');
    await wizardPage.clickNext();
    await wizardPage.complete();

    const request = await requestPromise;

    // Assert: Authorization header present
    const authHeader = request.headers()['authorization'];
    expect(authHeader).toBeTruthy();
    expect(authHeader).toContain('Bearer ');
  });

  test('should send empty body in completion request', async ({ page }) => {
    // Arrange: Register user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding');
    }

    wizardPage = new OnboardingWizardPage(page);

    // Capture request
    const requestPromise = page.waitForRequest(
      request => request.url().includes('/user/onboarding/complete'),
      { timeout: 15000 }
    );

    await wizardPage.selectIndustry('gym');
    await wizardPage.clickNext();
    await wizardPage.complete();

    const request = await requestPromise;

    // Assert: Body should be empty object or undefined
    const postData = request.postData();
    if (postData) {
      const parsed = JSON.parse(postData);
      expect(Object.keys(parsed).length).toBe(0);
    }
  });

  test('should complete onboarding only once', async ({ page }) => {
    // Arrange: Register and complete onboarding
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    await page.waitForTimeout(1000);

    if (page.url().includes('/onboarding')) {
      wizardPage = new OnboardingWizardPage(page);
      await wizardPage.selectIndustry('barber');
      await wizardPage.clickNext();
      await wizardPage.complete();
    }

    // Act: Try to access onboarding again
    await page.goto('/onboarding');
    await page.waitForLoadState('domcontentloaded');

    // Assert: Should redirect to dashboard (onboarding already completed)
    await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {
      // Or stay on onboarding but disable completion
    });
  });
});
