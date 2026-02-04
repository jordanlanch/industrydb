/**
 * Page Object Model for API Keys Page
 *
 * Provides methods to interact with API key management
 */

import { Page, expect } from '@playwright/test';

export class APIKeysPage {
  constructor(private page: Page) {}

  /**
   * Navigate to API keys page
   */
  async goto() {
    await this.page.goto('/dashboard/api-keys');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click create API key button
   */
  async clickCreateButton() {
    await this.page.click('button:has-text("Create API Key"), button:has-text("New API Key")');
  }

  /**
   * Fill API key creation form
   */
  async fillCreateForm(name: string, expiresAt?: string) {
    await this.page.fill('input[name="name"], input[placeholder*="name"]', name);

    if (expiresAt) {
      await this.page.fill('input[name="expires_at"], input[type="date"]', expiresAt);
    }
  }

  /**
   * Submit API key creation
   */
  async submitCreate() {
    await this.page.click('button[type="submit"], button:has-text("Create")');
  }

  /**
   * Create API key (complete flow)
   */
  async createAPIKey(name: string, expiresAt?: string) {
    await this.clickCreateButton();
    await this.page.waitForTimeout(500);
    await this.fillCreateForm(name, expiresAt);
    await this.submitCreate();
  }

  /**
   * Get displayed plain text key (only shown once!)
   */
  async getPlainKey(): Promise<string> {
    const keyElement = this.page.locator('[data-testid="api-key-plain"], .api-key-value, code');
    await expect(keyElement.first()).toBeVisible({ timeout: 10000 });
    return await keyElement.first().textContent() || '';
  }

  /**
   * Click to copy API key
   */
  async clickCopyKey() {
    await this.page.click('button:has-text("Copy"), [data-testid="copy-key"]');
  }

  /**
   * Close API key creation dialog
   */
  async closeCreateDialog() {
    await this.page.click('button:has-text("Close"), button:has-text("Done"), button[aria-label="Close"]');
  }

  /**
   * Find API key row in list
   */
  async findKeyRow(name: string) {
    return this.page.locator(`tr:has-text("${name}"), [data-key-name="${name}"]`).first();
  }

  /**
   * Click revoke button for specific key
   */
  async clickRevoke(keyName: string) {
    const row = await this.findKeyRow(keyName);
    await row.locator('button:has-text("Revoke")').click();
  }

  /**
   * Confirm revoke action
   */
  async confirmRevoke() {
    await this.page.click('button:has-text("Confirm"), button:has-text("Yes")');
  }

  /**
   * Click delete button for specific key
   */
  async clickDelete(keyName: string) {
    const row = await this.findKeyRow(keyName);
    await row.locator('button:has-text("Delete")').click();
  }

  /**
   * Confirm delete action
   */
  async confirmDelete() {
    await this.page.click('button:has-text("Confirm"), button:has-text("Delete")');
  }

  /**
   * Click edit/rename button
   */
  async clickEdit(keyName: string) {
    const row = await this.findKeyRow(keyName);
    await row.locator('button:has-text("Edit"), [aria-label="Edit"]').click();
  }

  /**
   * Update API key name
   */
  async updateName(oldName: string, newName: string) {
    await this.clickEdit(oldName);
    await this.page.waitForTimeout(500);
    await this.page.fill('input[name="name"]', newName);
    await this.page.click('button:has-text("Save"), button[type="submit"]');
  }

  /**
   * Assert API key is in list
   */
  async expectKeyInList(name: string) {
    const row = await this.findKeyRow(name);
    await expect(row).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert API key is NOT in list
   */
  async expectKeyNotInList(name: string) {
    const row = this.page.locator(`tr:has-text("${name}")`);
    await expect(row).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert revoked badge is shown
   */
  async expectRevoked(keyName: string) {
    const row = await this.findKeyRow(keyName);
    const badge = row.locator('text=Revoked, [data-revoked="true"]');
    await expect(badge).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert usage count is displayed
   */
  async expectUsageCount(keyName: string, count: number) {
    const row = await this.findKeyRow(keyName);
    const usageText = row.locator(`text=${count}`);
    await expect(usageText).toBeVisible({ timeout: 5000 }).catch(() => {});
  }

  /**
   * Assert warning message is shown
   */
  async expectWarning(message: string) {
    const warning = this.page.locator(`text=${message}`);
    await expect(warning.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert upgrade prompt for free tier
   */
  async expectUpgradePrompt() {
    const prompt = this.page.locator('text=Business tier, text=upgrade to access, .upgrade-prompt');
    await expect(prompt.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert create button is disabled
   */
  async expectCreateDisabled() {
    const button = this.page.locator('button:has-text("Create API Key")');
    const isDisabled = await button.isDisabled();
    expect(isDisabled).toBeTruthy();
  }

  /**
   * Get API key statistics
   */
  async getStats(): Promise<{ total: number; active: number; revoked: number }> {
    // Parse stats from page
    const totalText = await this.page.locator('[data-stat="total"]').textContent().catch(() => '0');
    const activeText = await this.page.locator('[data-stat="active"]').textContent().catch(() => '0');
    const revokedText = await this.page.locator('[data-stat="revoked"]').textContent().catch(() => '0');

    return {
      total: parseInt(totalText || '0') || 0,
      active: parseInt(activeText || '0') || 0,
      revoked: parseInt(revokedText || '0') || 0,
    };
  }

  /**
   * Assert page is loaded
   */
  async expectPageLoaded() {
    await expect(this.page.locator('text=API Keys, h1:has-text("API")').first()).toBeVisible({ timeout: 5000 });
  }
}
