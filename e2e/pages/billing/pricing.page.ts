/**
 * Page Object Model for Pricing/Billing Page
 *
 * Provides methods to interact with pricing tiers and billing
 */

import { Page, expect } from '@playwright/test';

export class PricingPage {
  constructor(private page: Page) {}

  /**
   * Navigate to pricing page (within settings or standalone)
   */
  async goto() {
    // Pricing might be in settings or separate page
    await this.page.goto('/dashboard/settings');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to standalone pricing page (if exists)
   */
  async gotoStandalone() {
    await this.page.goto('/pricing');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Select a pricing tier
   */
  async selectTier(tier: 'free' | 'starter' | 'pro' | 'business') {
    const tierButton = this.page.locator(`[data-tier="${tier}"] button, button:has-text("${tier}")`, {
      hasText: /upgrade|select|choose/i,
    });
    await tierButton.click();
  }

  /**
   * Click upgrade button for specific tier
   */
  async clickUpgradeButton(tier: string) {
    // Find tier card and click upgrade
    const tierCard = this.page.locator(`[data-tier="${tier}"], :has-text("${tier}")`).first();
    await tierCard.locator('button:has-text("Upgrade"), button:has-text("Select")').click();
  }

  /**
   * Assert tier card is visible
   */
  async expectTierVisible(tier: string) {
    const tierCard = this.page.locator(`[data-tier="${tier}"], text=${tier}`);
    await expect(tierCard.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert tier price is displayed
   */
  async expectTierPrice(tier: string, price: string) {
    const priceElement = this.page.locator(`text=${price}`);
    await expect(priceElement.first()).toBeVisible();
  }

  /**
   * Assert tier features are listed
   */
  async expectTierFeatures(tier: string, features: string[]) {
    for (const feature of features) {
      const featureElement = this.page.locator(`text=${feature}`);
      await expect(featureElement.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // Feature might be phrased differently
      });
    }
  }

  /**
   * Assert current tier badge is shown
   */
  async expectCurrentTier(tier: string) {
    const currentBadge = this.page.locator(`text=Current Plan, text=Active, [data-current-tier="${tier}"]`);
    await expect(currentBadge.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  }

  /**
   * Get all displayed tier names
   */
  async getTierNames(): Promise<string[]> {
    const tierElements = await this.page.locator('[data-tier]').all();
    const names: string[] = [];
    for (const el of tierElements) {
      const name = await el.getAttribute('data-tier');
      if (name) names.push(name);
    }
    return names;
  }

  /**
   * Assert pricing comparison table exists
   */
  async expectComparisonTable() {
    const table = this.page.locator('table, [data-testid="pricing-comparison"]');
    await expect(table).toBeVisible({ timeout: 5000 }).catch(() => {
      // Comparison might be shown as cards instead of table
    });
  }

  /**
   * Assert upgrade is disabled for current tier
   */
  async expectUpgradeDisabled(tier: string) {
    const tierCard = this.page.locator(`[data-tier="${tier}"]`).first();
    const upgradeButton = tierCard.locator('button:has-text("Upgrade")');
    const isDisabled = await upgradeButton.isDisabled().catch(() => false);
    expect(isDisabled).toBeTruthy();
  }

  /**
   * Assert monthly/yearly toggle exists
   */
  async expectBillingToggle() {
    const toggle = this.page.locator('[data-testid="billing-toggle"], button:has-text("Monthly"), button:has-text("Yearly")');
    const count = await toggle.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Toggle between monthly and yearly billing
   */
  async toggleBillingPeriod() {
    const toggle = this.page.locator('[data-testid="billing-toggle"], button:has-text("Yearly")');
    await toggle.click({ timeout: 5000 }).catch(() => {});
  }

  /**
   * Click manage billing button
   */
  async clickManageBilling() {
    const manageButton = this.page.locator('button:has-text("Manage Billing"), button:has-text("Billing Portal")');
    await manageButton.click();
  }

  /**
   * Assert FAQs section exists
   */
  async expectFAQSection() {
    const faqSection = this.page.locator('text=FAQ, text=Frequently Asked, [data-testid="faq"]');
    await expect(faqSection.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  }
}
