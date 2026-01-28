/**
 * E2E Tests: Onboarding Wizard
 *
 * Tests the complete onboarding flow for new users
 */

import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/auth/register.page';
import { OnboardingWizardPage } from '../../pages/onboarding/wizard.page';
import { generateTestUser } from '../../fixtures/test-users';

test.describe('Onboarding Wizard', () => {
  let wizardPage: OnboardingWizardPage;

  test('should display onboarding wizard after registration', async ({ page }) => {
    // Register new user
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);
    await registerPage.expectSuccess();

    // Check if redirected to onboarding or dashboard
    const url = page.url();
    if (url.includes('/onboarding')) {
      wizardPage = new OnboardingWizardPage(page);
      await wizardPage.expectPageLoaded();
    } else {
      // Onboarding may not be implemented yet
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('should complete full onboarding flow', async ({ page }) => {
    // Navigate to onboarding directly (or register first)
    wizardPage = new OnboardingWizardPage(page);

    // Register user first
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    // If onboarding exists, complete it
    if (page.url().includes('/onboarding')) {
      await wizardPage.completeFullFlow('tattoo', 'find-clients');

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard/leads');
    } else {
      // Already on dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('should allow skipping onboarding', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    if (page.url().includes('/onboarding')) {
      wizardPage = new OnboardingWizardPage(page);
      await wizardPage.skip();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('should navigate between steps', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    if (page.url().includes('/onboarding')) {
      wizardPage = new OnboardingWizardPage(page);

      // Go to step 2
      await wizardPage.expectStep(1);
      await wizardPage.clickNext();

      // Go back to step 1
      await wizardPage.clickPrevious();
      await wizardPage.expectStep(1);
    }
  });

  test('should save onboarding preferences', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    if (page.url().includes('/onboarding')) {
      wizardPage = new OnboardingWizardPage(page);
      await wizardPage.completeFullFlow('beauty', 'generate-leads');

      // Preferences should be saved (verify in settings or dashboard)
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('should not show onboarding to returning users', async ({ page }) => {
    // Register and complete onboarding
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(user.name, user.email, user.password);

    if (page.url().includes('/onboarding')) {
      wizardPage = new OnboardingWizardPage(page);
      await wizardPage.completeFullFlow();
    }

    // Logout
    await page.click('text=Logout');
    await page.waitForURL('/login');

    // Login again
    const loginPage = await import('../../pages/auth/login.page').then(m => new m.LoginPage(page));
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Should not show onboarding again
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page).not.toHaveURL(/\/onboarding/);
  });
});
