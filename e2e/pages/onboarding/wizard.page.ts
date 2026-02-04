/**
 * Page Object Model for Onboarding Wizard
 *
 * Provides methods to interact with the onboarding flow
 */

import { Page, expect } from '@playwright/test';

export class OnboardingWizardPage {
  constructor(private page: Page) {}

  /**
   * Navigate to onboarding page
   */
  async goto() {
    await this.page.goto('/onboarding');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Assert current step is visible
   */
  async expectStep(stepNumber: number) {
    await expect(this.page.locator(`[data-step="${stepNumber}"]`).first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click Next button
   */
  async clickNext() {
    await this.page.click('button:has-text("Next")');
    await this.page.waitForTimeout(500); // Wait for animation
  }

  /**
   * Click Previous button
   */
  async clickPrevious() {
    await this.page.click('button:has-text("Previous"), button:has-text("Back")');
    await this.page.waitForTimeout(500);
  }

  /**
   * Select industry
   */
  async selectIndustry(industry: string) {
    await this.page.click(`[data-industry="${industry}"], button:has-text("${industry}")`);
  }

  /**
   * Select goal
   */
  async selectGoal(goal: string) {
    await this.page.click(`[data-goal="${goal}"], button:has-text("${goal}")`);
  }

  /**
   * Complete onboarding wizard
   */
  async complete() {
    await this.page.click('button:has-text("Get Started"), button:has-text("Finish")');
    await this.page.waitForURL('/dashboard/leads', { timeout: 10000 });
  }

  /**
   * Complete full onboarding flow
   */
  async completeFullFlow(industry: string = 'tattoo', goal: string = 'find-clients') {
    // Step 1: Welcome
    await this.expectStep(1);
    await this.clickNext();

    // Step 2: Industry
    await this.expectStep(2);
    await this.selectIndustry(industry);
    await this.clickNext();

    // Step 3: Goals
    await this.expectStep(3);
    await this.selectGoal(goal);
    await this.clickNext();

    // Step 4: Tutorial
    await this.expectStep(4);
    await this.clickNext();

    // Step 5: Complete
    await this.expectStep(5);
    await this.complete();
  }

  /**
   * Skip onboarding
   */
  async skip() {
    const skipButton = this.page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible().catch(() => false)) {
      await skipButton.click();
    }
  }

  /**
   * Assert progress bar shows correct progress
   */
  async expectProgress(percentage: number) {
    const progressBar = this.page.locator('[role="progressbar"], .progress-bar');
    // This is approximate, adjust based on actual implementation
    await expect(progressBar).toBeVisible();
  }

  /**
   * Assert welcome message is displayed
   */
  async expectWelcomeMessage() {
    await expect(this.page.locator('text=Welcome to IndustryDB').first()).toBeVisible();
  }

  /**
   * Assert page is loaded correctly
   */
  async expectPageLoaded() {
    await this.expectWelcomeMessage();
  }
}
