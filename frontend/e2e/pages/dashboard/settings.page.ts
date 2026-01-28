/**
 * Page Object Model for Settings Page
 *
 * Provides methods to interact with user settings
 */

import { Page, expect } from '@playwright/test';

export class SettingsPage {
  constructor(private page: Page) {}

  /**
   * Navigate to settings page
   */
  async goto() {
    await this.page.goto('/dashboard/settings');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Update profile name
   */
  async updateName(name: string) {
    await this.page.fill('input[name="name"], input[id="name"]', name);
    await this.page.click('button:has-text("Save")');
  }

  /**
   * Update profile email
   */
  async updateEmail(email: string) {
    await this.page.fill('input[name="email"], input[id="email"]', email);
    await this.page.click('button:has-text("Save")');
  }

  /**
   * Click on billing tab
   */
  async goToBillingTab() {
    await this.page.click('text=Billing');
  }

  /**
   * Click upgrade button
   */
  async clickUpgrade() {
    await this.page.click('button:has-text("Upgrade")');
  }

  /**
   * Click manage billing button
   */
  async clickManageBilling() {
    await this.page.click('button:has-text("Manage Billing")');
  }

  /**
   * Assert current tier is displayed
   */
  async expectTier(tier: string) {
    await expect(this.page.locator(`text=${tier}`).first()).toBeVisible();
  }

  /**
   * Click GDPR export button
   */
  async clickExportData() {
    await this.page.click('button:has-text("Download My Data")');
  }

  /**
   * Click delete account button
   */
  async clickDeleteAccount() {
    await this.page.click('button:has-text("Delete Account")');
  }

  /**
   * Confirm account deletion
   */
  async confirmDeleteAccount(password: string) {
    // Wait for confirmation dialog
    await this.page.waitForSelector('text=Are you sure', { timeout: 5000 });

    // Enter password
    const passwordInput = this.page.locator('input[type="password"]').last();
    await passwordInput.fill(password);

    // Click confirm button
    await this.page.click('button:has-text("Delete My Account")');
  }

  /**
   * Assert success message is displayed
   */
  async expectSuccessMessage(message: string = 'Success') {
    await expect(this.page.locator(`text=${message}`).first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert page is loaded correctly
   */
  async expectPageLoaded() {
    await expect(this.page.locator('text=Profile').first()).toBeVisible();
    await expect(this.page.locator('text=Billing').first()).toBeVisible();
  }

  /**
   * Get current profile data
   */
  async getProfileData(): Promise<{ name: string; email: string }> {
    return {
      name: await this.page.inputValue('input[name="name"], input[id="name"]'),
      email: await this.page.inputValue('input[name="email"], input[id="email"]'),
    };
  }
}
