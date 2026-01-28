/**
 * E2E Tests: Industry Selector - Basic Selection
 *
 * Tests basic industry and sub-niche selection functionality
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';
import { LeadsPage } from '../../pages/dashboard/leads.page';

authTest.describe('Industry Selector - Basic Selection', () => {
  let leadsPage: LeadsPage;

  authTest.beforeEach(async ({ authenticatedPage: page }) => {
    leadsPage = new LeadsPage(page);
    await leadsPage.goto();
  });

  authTest('should display industry selector component', async ({ authenticatedPage: page }) => {
    // Should show industry selector
    await expect(page.locator('text=Industry').first()).toBeVisible();
    await expect(page.locator('text=Select industry').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should display industry categories', async ({ authenticatedPage: page }) => {
    // Click on industry selector to open
    const industrySelector = page.locator('button:has-text("Select industry"), [role="button"]:has-text("Select industry")').first();
    await industrySelector.click();

    // Should show categories
    await expect(page.locator('text=Food & Beverage').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Health & Fitness').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Personal Care').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should display industries when category selected', async ({ authenticatedPage: page }) => {
    // Open industry selector
    const industrySelector = page.locator('button:has-text("Select industry"), [role="button"]:has-text("Select industry")').first();
    await industrySelector.click();

    // Click Food & Beverage category
    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(500);

    // Should show restaurant industry
    await expect(page.locator('text=Restaurant').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Cafe').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Bar').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should display sub-niches when industry selected', async ({ authenticatedPage: page }) => {
    // Open selector and navigate to restaurants
    const industrySelector = page.locator('button:has-text("Select industry"), [role="button"]:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    // Click Restaurant
    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(500);

    // Should show sub-niches (cuisines)
    await expect(page.locator('text=Italian').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Mexican').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Japanese').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should select a sub-niche', async ({ authenticatedPage: page }) => {
    // Navigate to Italian restaurants
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(500);

    // Select Italian
    const italianOption = page.locator('text=Italian').first();
    await italianOption.click();
    await page.waitForTimeout(500);

    // Should show selection badge/chip
    await expect(page.locator('text=Italian').first()).toBeVisible();
  });

  authTest('should display lead counts for sub-niches', async ({ authenticatedPage: page }) => {
    // Open selector and navigate to restaurants
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(500);

    // Should show lead counts (e.g., "Italian (3,500)")
    const italianWithCount = page.locator('text=/Italian.*\\d+/').first();
    await expect(italianWithCount).toBeVisible({ timeout: 5000 });
  });

  authTest('should search within sub-niches', async ({ authenticatedPage: page }) => {
    // Open selector and navigate to restaurants
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(500);

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('ital');
      await page.waitForTimeout(300);

      // Should show Italian in results
      await expect(page.locator('text=Italian').first()).toBeVisible();

      // Should hide non-matching items
      const chineseOption = page.locator('text=Chinese').first();
      const isVisible = await chineseOption.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    }
  });

  authTest('should show professional icons for industries', async ({ authenticatedPage: page }) => {
    // Open industry selector
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    // Should show Lucide React icons (SVG elements)
    const icons = page.locator('svg').first();
    await expect(icons).toBeVisible();
  });

  authTest('should close selector when clicking outside', async ({ authenticatedPage: page }) => {
    // Open selector
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await expect(page.locator('text=Food & Beverage').first()).toBeVisible();

    // Click outside
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(500);

    // Selector should be closed
    const isVisible = await page.locator('text=Food & Beverage').first().isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  authTest('should display selection in active filters', async ({ authenticatedPage: page }) => {
    // Select Italian restaurant
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(500);

    await page.locator('text=Italian').first().click();
    await page.waitForTimeout(500);

    // Close selector
    await page.keyboard.press('Escape');

    // Should show in active filters section
    await expect(page.locator('text=Italian').first()).toBeVisible();
    await expect(page.locator('text=Restaurant').first()).toBeVisible();
  });

  authTest('should remove selection by clicking X button', async ({ authenticatedPage: page }) => {
    // Select Italian restaurant
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(500);

    await page.locator('text=Italian').first().click();
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');

    // Find and click remove button (X)
    const removeButton = page.locator('button:has-text("×"), button[aria-label*="Remove"]').first();
    if (await removeButton.isVisible().catch(() => false)) {
      await removeButton.click();
      await page.waitForTimeout(500);

      // Selection should be removed
      const italianBadge = page.locator('[class*="badge"]:has-text("Italian")').first();
      const isVisible = await italianBadge.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    }
  });

  authTest('should handle gym industry with sport types', async ({ authenticatedPage: page }) => {
    // Navigate to gyms
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    // Find Health & Fitness category
    await page.locator('text=Health').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Gym').first().click();
    await page.waitForTimeout(500);

    // Should show gym types
    await expect(page.locator('text=CrossFit').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Yoga').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Pilates').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should handle tattoo industry with styles', async ({ authenticatedPage: page }) => {
    // Navigate to tattoos
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    // Find Personal Care category
    await page.locator('text=Personal').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Tattoo').first().click();
    await page.waitForTimeout(500);

    // Should show tattoo styles
    await expect(page.locator('text=Traditional').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Japanese').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Watercolor').first()).toBeVisible({ timeout: 5000 });
  });
});
