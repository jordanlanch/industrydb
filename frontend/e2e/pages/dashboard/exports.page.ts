/**
 * Page Object Model for Exports Page
 *
 * Provides methods to interact with the exports history
 */

import { Page, expect } from '@playwright/test';

export class ExportsPage {
  constructor(private page: Page) {}

  /**
   * Navigate to exports page
   */
  async goto() {
    await this.page.goto('/dashboard/exports');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get number of exports displayed
   */
  async getExportsCount(): Promise<number> {
    const exportCards = this.page.locator('[data-testid="export-item"], .export-item, tr');
    return exportCards.count();
  }

  /**
   * Assert exports are displayed
   */
  async expectExports(minCount: number = 1) {
    const count = await this.getExportsCount();
    expect(count).toBeGreaterThanOrEqual(minCount);
  }

  /**
   * Assert no exports message is displayed
   */
  async expectNoExports() {
    await expect(this.page.locator('text=No exports').first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click download button for export
   */
  async downloadExport(index: number = 0) {
    const downloadButton = this.page.locator('button:has-text("Download")').nth(index);
    await downloadButton.click();
  }

  /**
   * Get export data from list
   */
  async getExportData(index: number = 0): Promise<any> {
    const exportItem = this.page.locator('[data-testid="export-item"], .export-item, tr').nth(index);

    return {
      format: await exportItem.locator('text=/CSV|Excel/i').first().textContent().catch(() => null),
      status: await exportItem.locator('text=/processing|completed|failed/i').first().textContent().catch(() => null),
      createdAt: await exportItem.locator('text=/ago|at/i').first().textContent().catch(() => null),
    };
  }

  /**
   * Assert page is loaded correctly
   */
  async expectPageLoaded() {
    await expect(this.page.locator('text=Exports').first()).toBeVisible();
  }

  /**
   * Wait for export to complete
   */
  async waitForExportComplete(index: number = 0, timeout: number = 30000) {
    const exportItem = this.page.locator('[data-testid="export-item"], .export-item, tr').nth(index);
    await expect(exportItem.locator('text=completed').first()).toBeVisible({ timeout });
  }
}
