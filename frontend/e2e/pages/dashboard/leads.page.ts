/**
 * Page Object Model for Leads Search Page
 *
 * Provides methods to interact with the leads search and results
 */

import { Page, expect } from '@playwright/test';

export class LeadsPage {
  constructor(private page: Page) {}

  /**
   * Navigate to leads page
   */
  async goto() {
    await this.page.goto('/dashboard/leads');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Select industry from dropdown
   */
  async selectIndustry(industry: string) {
    await this.page.selectOption('select[name="industry"], select:has(option[value="tattoo"])', industry);
  }

  /**
   * Fill country field
   */
  async fillCountry(country: string) {
    const countryInput = this.page.locator('input[name="country"], input[placeholder*="Country"]');
    await countryInput.fill(country);
  }

  /**
   * Fill city field
   */
  async fillCity(city: string) {
    const cityInput = this.page.locator('input[name="city"], input[placeholder*="City"]');
    await cityInput.fill(city);
  }

  /**
   * Check "Has Email" filter
   */
  async checkHasEmail() {
    const emailCheckbox = this.page.locator('input[name="has_email"], input[type="checkbox"]:near(:text("Has Email"))');
    await emailCheckbox.check();
  }

  /**
   * Check "Has Phone" filter
   */
  async checkHasPhone() {
    const phoneCheckbox = this.page.locator('input[name="has_phone"], input[type="checkbox"]:near(:text("Has Phone"))');
    await phoneCheckbox.check();
  }

  /**
   * Click search button
   */
  async search() {
    await this.page.click('button:has-text("Search")');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      // Ignore timeout, results may load quickly
    });
  }

  /**
   * Complete search with all filters
   */
  async searchWithFilters(filters: {
    industry?: string;
    country?: string;
    city?: string;
    hasEmail?: boolean;
    hasPhone?: boolean;
  }) {
    if (filters.industry) await this.selectIndustry(filters.industry);
    if (filters.country) await this.fillCountry(filters.country);
    if (filters.city) await this.fillCity(filters.city);
    if (filters.hasEmail) await this.checkHasEmail();
    if (filters.hasPhone) await this.checkHasPhone();

    await this.search();
  }

  /**
   * Click Export CSV button
   */
  async exportCSV() {
    await this.page.click('button:has-text("Export CSV")');
  }

  /**
   * Click Export Excel button
   */
  async exportExcel() {
    await this.page.click('button:has-text("Export Excel")');
  }

  /**
   * Get number of results displayed
   */
  async getResultsCount(): Promise<number> {
    const leadCards = this.page.locator('[data-testid="lead-card"], .lead-card, [class*="lead"]');
    return leadCards.count();
  }

  /**
   * Assert results are displayed
   */
  async expectResults(minCount: number = 1) {
    const count = await this.getResultsCount();
    expect(count).toBeGreaterThanOrEqual(minCount);
  }

  /**
   * Assert no results message is displayed
   */
  async expectNoResults() {
    await expect(this.page.locator('text=No leads found').first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert usage information is displayed
   */
  async expectUsageInfo() {
    await expect(this.page.locator('text=Usage').first()).toBeVisible();
    await expect(this.page.locator('text=Leads accessed').first()).toBeVisible();
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<{ used: number; limit: number; remaining: number } | null> {
    const usageText = await this.page.locator('text=remaining').first().textContent().catch(() => null);
    if (!usageText) return null;

    // Parse "X remaining" or "X/Y" format
    const match = usageText.match(/(\d+)\s*\/\s*(\d+)|(\d+)\s*remaining/);
    if (!match) return null;

    if (match[1] && match[2]) {
      const used = parseInt(match[1]);
      const limit = parseInt(match[2]);
      return { used, limit, remaining: limit - used };
    } else if (match[3]) {
      const remaining = parseInt(match[3]);
      return { used: 0, limit: 0, remaining };
    }

    return null;
  }

  /**
   * Click on first lead result
   */
  async clickFirstLead() {
    const firstLead = this.page.locator('[data-testid="lead-card"], .lead-card').first();
    await firstLead.click();
  }

  /**
   * Get lead data from result card
   */
  async getLeadData(index: number = 0): Promise<any> {
    const leadCard = this.page.locator('[data-testid="lead-card"], .lead-card').nth(index);

    return {
      name: await leadCard.locator('[data-testid="lead-name"], .lead-name, h3, h4').first().textContent(),
      email: await leadCard.locator('text=@').first().textContent().catch(() => null),
      phone: await leadCard.locator('text=+').first().textContent().catch(() => null),
    };
  }

  /**
   * Assert filter options are visible
   */
  async expectFiltersVisible() {
    await expect(this.page.locator('text=Industry').first()).toBeVisible();
    await expect(this.page.locator('text=Country').first()).toBeVisible();
    await expect(this.page.locator('text=City').first()).toBeVisible();
  }

  /**
   * Assert export buttons are visible
   */
  async expectExportButtonsVisible() {
    await expect(this.page.locator('button:has-text("Export CSV")').first()).toBeVisible();
    await expect(this.page.locator('button:has-text("Export Excel")').first()).toBeVisible();
  }

  /**
   * Assert page is loaded correctly
   */
  async expectPageLoaded() {
    await expect(this.page.locator('text=Search Leads').first()).toBeVisible();
    await this.expectFiltersVisible();
  }

  /**
   * Clear all filters
   */
  async clearFilters() {
    const clearButton = this.page.locator('button:has-text("Clear")');
    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
    }
  }

  /**
   * Navigate to next page of results
   */
  async goToNextPage() {
    const nextButton = this.page.locator('button:has-text("Next")');
    await nextButton.click();
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Navigate to previous page of results
   */
  async goToPreviousPage() {
    const prevButton = this.page.locator('button:has-text("Previous")');
    await prevButton.click();
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }
}
