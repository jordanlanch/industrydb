/**
 * Page Object Model for Saved Searches Page
 *
 * Provides methods to interact with saved searches functionality
 */

import { Page, expect } from '@playwright/test';

export class SavedSearchesPage {
  constructor(private page: Page) {}

  /**
   * Navigate to saved searches page
   */
  async goto() {
    await this.page.goto('/dashboard/saved-searches');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Open save search dialog from leads page
   */
  async openSaveDialog() {
    const saveButton = this.page.locator('button:has-text("Save Search")');
    await saveButton.click();
    await expect(this.page.locator('text=Save Current Search').first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Fill search name in save dialog
   */
  async fillSearchName(name: string) {
    const nameInput = this.page.locator('input[name="name"], input[placeholder*="search name"]');
    await nameInput.fill(name);
  }

  /**
   * Click save button in dialog
   */
  async clickSave() {
    const saveButton = this.page.locator('button:has-text("Save")').last();
    await saveButton.click();
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Save a search with given name
   */
  async saveSearch(name: string) {
    await this.openSaveDialog();
    await this.fillSearchName(name);
    await this.clickSave();
  }

  /**
   * Get count of saved searches displayed
   */
  async getSavedSearchesCount(): Promise<number> {
    const searchCards = this.page.locator('[data-testid="saved-search-card"], .saved-search-card, [class*="search-card"]');
    return searchCards.count();
  }

  /**
   * Click on a saved search by name
   */
  async clickSavedSearch(name: string) {
    const searchCard = this.page.locator(`text="${name}"`).first();
    await searchCard.click();
  }

  /**
   * Click "Run Search" button on a saved search
   */
  async runSearch(name: string) {
    const searchCard = this.page.locator(`text="${name}"`).locator('..').locator('..');
    const runButton = searchCard.locator('button:has-text("Run Search")');
    await runButton.click();
    await this.page.waitForURL(/.*\/dashboard\/leads.*/);
  }

  /**
   * Delete a saved search
   */
  async deleteSearch(name: string) {
    const searchCard = this.page.locator(`text="${name}"`).locator('..').locator('..');
    const deleteButton = searchCard.locator('button:has-text("Delete"), button[aria-label*="Delete"]');
    await deleteButton.click();

    // Confirm deletion if dialog appears
    const confirmButton = this.page.locator('button:has-text("Delete"), button:has-text("Confirm")').last();
    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }

    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }

  /**
   * Get saved search details
   */
  async getSearchDetails(name: string): Promise<any> {
    const searchCard = this.page.locator(`text="${name}"`).locator('..').locator('..');

    return {
      name: await searchCard.locator('h3, h4, [class*="title"]').first().textContent(),
      filters: await searchCard.locator('[class*="filter"], [class*="badge"]').allTextContents(),
    };
  }

  /**
   * Assert page is loaded correctly
   */
  async expectPageLoaded() {
    await expect(this.page.locator('text=Saved Searches').first()).toBeVisible();
  }

  /**
   * Assert saved search exists
   */
  async expectSearchExists(name: string) {
    await expect(this.page.locator(`text="${name}"`).first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert saved search does not exist
   */
  async expectSearchNotExists(name: string) {
    await expect(this.page.locator(`text="${name}"`).first()).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert empty state is displayed
   */
  async expectEmptyState() {
    await expect(this.page.locator('text=No saved searches').first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert success message is displayed
   */
  async expectSuccessMessage(message: string) {
    await expect(this.page.locator(`text=${message}`).first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert error message is displayed
   */
  async expectErrorMessage(message: string) {
    await expect(this.page.locator(`text=${message}`).first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Check if "Run Search" button is visible
   */
  async expectRunButtonVisible(name: string) {
    const searchCard = this.page.locator(`text="${name}"`).locator('..').locator('..');
    await expect(searchCard.locator('button:has-text("Run Search")').first()).toBeVisible();
  }

  /**
   * Check if "Delete" button is visible
   */
  async expectDeleteButtonVisible(name: string) {
    const searchCard = this.page.locator(`text="${name}"`).locator('..').locator('..');
    await expect(searchCard.locator('button:has-text("Delete"), button[aria-label*="Delete"]').first()).toBeVisible();
  }

  /**
   * Navigate back to leads page
   */
  async goToLeadsPage() {
    await this.page.click('a[href*="/leads"], button:has-text("New Search")');
    await this.page.waitForURL(/.*\/dashboard\/leads.*/);
  }
}
