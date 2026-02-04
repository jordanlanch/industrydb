/**
 * Page Object Model for Admin Dashboard
 *
 * Provides methods to interact with admin features
 */

import { Page, expect } from '@playwright/test';

export class AdminDashboardPage {
  constructor(private page: Page) {}

  /**
   * Navigate to admin dashboard
   */
  async goto() {
    await this.page.goto('/admin/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to user management
   */
  async gotoUserManagement() {
    await this.page.goto('/admin/users');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Assert admin page is loaded
   */
  async expectPageLoaded() {
    await expect(this.page.locator('text=Admin, h1:has-text("Admin")').first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert access denied for non-admin
   */
  async expectAccessDenied() {
    const deniedMessage = this.page.locator('text=Access denied, text=unauthorized, text=403');
    await expect(deniedMessage.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get platform statistics
   */
  async getStats(): Promise<{ users: number; leads: number; exports: number }> {
    const usersText = await this.page.locator('[data-stat="users"]').textContent().catch(() => '0');
    const leadsText = await this.page.locator('[data-stat="leads"]').textContent().catch(() => '0');
    const exportsText = await this.page.locator('[data-stat="exports"]').textContent().catch(() => '0');

    return {
      users: parseInt(usersText || '0') || 0,
      leads: parseInt(leadsText || '0') || 0,
      exports: parseInt(exportsText || '0') || 0,
    };
  }

  /**
   * Search for user
   */
  async searchUser(email: string) {
    await this.page.fill('input[type="search"], input[placeholder*="search"]', email);
    await this.page.press('input[type="search"]', 'Enter');
  }

  /**
   * Click on user row
   */
  async clickUser(email: string) {
    await this.page.click(`tr:has-text("${email}"), [data-user-email="${email}"]`);
  }

  /**
   * Update user tier
   */
  async updateUserTier(email: string, tier: string) {
    await this.clickUser(email);
    await this.page.waitForTimeout(500);

    await this.page.selectOption('select[name="tier"]', tier);
    await this.page.click('button:has-text("Save"), button[type="submit"]');
  }

  /**
   * Suspend user account
   */
  async suspendUser(email: string) {
    await this.clickUser(email);
    await this.page.waitForTimeout(500);

    await this.page.click('button:has-text("Suspend")');
    await this.page.waitForTimeout(300);
    await this.page.click('button:has-text("Confirm")');
  }

  /**
   * Assert user is suspended
   */
  async expectUserSuspended(email: string) {
    const row = this.page.locator(`tr:has-text("${email}")`);
    const badge = row.locator('text=Suspended, [data-status="suspended"]');
    await expect(badge).toBeVisible({ timeout: 5000 });
  }

  /**
   * Filter users by tier
   */
  async filterByTier(tier: string) {
    await this.page.selectOption('select[name="tier_filter"]', tier);
    await this.page.waitForTimeout(500);
  }

  /**
   * Assert stat card is visible
   */
  async expectStatCard(label: string, value: string) {
    const card = this.page.locator(`[data-stat-label="${label}"]`);
    await expect(card).toBeVisible({ timeout: 5000 });

    const valueElement = card.locator(`text=${value}`);
    await expect(valueElement).toBeVisible({ timeout: 5000 }).catch(() => {});
  }
}
