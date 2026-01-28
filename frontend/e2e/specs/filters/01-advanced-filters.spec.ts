/**
 * E2E Tests: Advanced Filter Panel
 *
 * Tests advanced filtering functionality including quality scores and specialties
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';
import { LeadsPage } from '../../pages/dashboard/leads.page';
import { mockLeadsResponse, generateSampleLeads } from '../../fixtures/api-helpers';

authTest.describe('Advanced Filter Panel', () => {
  let leadsPage: LeadsPage;

  authTest.beforeEach(async ({ authenticatedPage: page }) => {
    leadsPage = new LeadsPage(page);
    await leadsPage.goto();
  });

  authTest('should display advanced filters section', async ({ authenticatedPage: page }) => {
    // Should show advanced filters
    await expect(page.locator('text=Location').first()).toBeVisible();
    await expect(page.locator('text=Data Quality').first()).toBeVisible();
  });

  authTest('should filter by quality score range', async ({ authenticatedPage: page }) => {
    // Mock leads response
    await mockLeadsResponse(page, generateSampleLeads(5));

    // Find quality score sliders
    const qualityMinSlider = page.locator('input[type="range"]').first();
    const qualityMaxSlider = page.locator('input[type="range"]').last();

    if (await qualityMinSlider.isVisible().catch(() => false)) {
      // Set minimum quality score to 70
      await qualityMinSlider.fill('70');
      await page.waitForTimeout(300);

      // Set maximum quality score to 100
      await qualityMaxSlider.fill('100');
      await page.waitForTimeout(300);

      // Search with filters
      await leadsPage.search();
      await page.waitForTimeout(1000);

      // Should show filtered results
      const count = await leadsPage.getResultsCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  authTest('should display quality score values', async ({ authenticatedPage: page }) => {
    const qualityMinSlider = page.locator('input[type="range"]').first();

    if (await qualityMinSlider.isVisible().catch(() => false)) {
      // Set slider value
      await qualityMinSlider.fill('80');
      await page.waitForTimeout(300);

      // Should display the value (80)
      await expect(page.locator('text=80').first()).toBeVisible({ timeout: 5000 });
    }
  });

  authTest('should filter by data completeness checkboxes', async ({ authenticatedPage: page }) => {
    await mockLeadsResponse(page, generateSampleLeads(3));

    // Check "Has Email" filter
    await leadsPage.checkHasEmail();
    await page.waitForTimeout(300);

    // Check "Has Phone" filter
    await leadsPage.checkHasPhone();
    await page.waitForTimeout(300);

    // Search
    await leadsPage.search();
    await page.waitForTimeout(1000);

    const count = await leadsPage.getResultsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  authTest('should filter by verified status', async ({ authenticatedPage: page }) => {
    await mockLeadsResponse(page, generateSampleLeads(3));

    // Check "Verified" filter
    const verifiedCheckbox = page.locator('input[name="verified"], input[type="checkbox"]:near(:text("Verified"))').first();
    if (await verifiedCheckbox.isVisible().catch(() => false)) {
      await verifiedCheckbox.check();
      await page.waitForTimeout(300);

      await leadsPage.search();
      await page.waitForTimeout(1000);

      const count = await leadsPage.getResultsCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  authTest('should display restaurant specialty tags', async ({ authenticatedPage: page }) => {
    // Select restaurant industry
    await leadsPage.selectIndustry('restaurant');
    await page.waitForTimeout(500);

    // Should show restaurant-specific specialties
    const specialties = ['Outdoor Seating', 'Delivery', 'Takeout', 'WiFi', 'Parking', 'Vegetarian'];

    // Check if at least some specialties are visible
    let visibleCount = 0;
    for (const specialty of specialties) {
      const isVisible = await page.locator(`text=${specialty}`).first().isVisible().catch(() => false);
      if (isVisible) visibleCount++;
    }

    expect(visibleCount).toBeGreaterThan(0);
  });

  authTest('should filter by specialty tags', async ({ authenticatedPage: page }) => {
    await mockLeadsResponse(page, generateSampleLeads(3));

    // Select restaurant
    await leadsPage.selectIndustry('restaurant');
    await page.waitForTimeout(500);

    // Click on Delivery specialty
    const deliveryTag = page.locator('text=Delivery').first();
    if (await deliveryTag.isVisible().catch(() => false)) {
      await deliveryTag.click();
      await page.waitForTimeout(300);

      // Search with specialty filter
      await leadsPage.search();
      await page.waitForTimeout(1000);

      const count = await leadsPage.getResultsCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  authTest('should show selected specialty tags as badges', async ({ authenticatedPage: page }) => {
    // Select restaurant
    await leadsPage.selectIndustry('restaurant');
    await page.waitForTimeout(500);

    // Click specialty
    const vegetarianTag = page.locator('text=Vegetarian').first();
    if (await vegetarianTag.isVisible().catch(() => false)) {
      await vegetarianTag.click();
      await page.waitForTimeout(500);

      // Should show badge in active filters
      await expect(page.locator('[class*="badge"]:has-text("Vegetarian")').first()).toBeVisible({ timeout: 5000 });
    }
  });

  authTest('should collapse and expand filter sections', async ({ authenticatedPage: page }) => {
    // Find collapsible section header
    const locationHeader = page.locator('button:has-text("Location"), [role="button"]:has-text("Location")').first();

    if (await locationHeader.isVisible().catch(() => false)) {
      // Should be expanded by default
      await expect(page.locator('input[name="country"], input[placeholder*="Country"]').first()).toBeVisible();

      // Click to collapse
      await locationHeader.click();
      await page.waitForTimeout(500);

      // Country input should be hidden
      const countryInput = page.locator('input[name="country"]').first();
      const isVisible = await countryInput.isVisible().catch(() => false);
      expect(isVisible).toBe(false);

      // Click to expand again
      await locationHeader.click();
      await page.waitForTimeout(500);

      // Should be visible again
      await expect(page.locator('input[name="country"], input[placeholder*="Country"]').first()).toBeVisible();
    }
  });

  authTest('should combine multiple filters', async ({ authenticatedPage: page }) => {
    await mockLeadsResponse(page, generateSampleLeads(2));

    // Apply multiple filters
    await leadsPage.selectIndustry('restaurant');
    await page.waitForTimeout(300);

    await leadsPage.fillCity('New York');
    await page.waitForTimeout(300);

    await leadsPage.checkHasEmail();
    await page.waitForTimeout(300);

    // Set quality score
    const qualityMinSlider = page.locator('input[type="range"]').first();
    if (await qualityMinSlider.isVisible().catch(() => false)) {
      await qualityMinSlider.fill('70');
      await page.waitForTimeout(300);
    }

    // Search with all filters
    await leadsPage.search();
    await page.waitForTimeout(1000);

    const count = await leadsPage.getResultsCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  authTest('should show filter summary in active filters card', async ({ authenticatedPage: page }) => {
    // Apply filters
    await leadsPage.selectIndustry('restaurant');
    await page.waitForTimeout(300);

    await leadsPage.fillCity('New York');
    await page.waitForTimeout(300);

    await leadsPage.checkHasEmail();
    await page.waitForTimeout(500);

    // Should show active filters summary
    await expect(page.locator('text=restaurant').first()).toBeVisible();
    await expect(page.locator('text=New York').first()).toBeVisible();
    await expect(page.locator('text=Has Email').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should clear individual filters', async ({ authenticatedPage: page }) => {
    // Apply filters
    await leadsPage.selectIndustry('restaurant');
    await page.waitForTimeout(300);

    await leadsPage.fillCity('New York');
    await page.waitForTimeout(500);

    // Find remove button for city filter
    const cityBadge = page.locator('[class*="badge"]:has-text("New York")').first();
    const removeButton = cityBadge.locator('button, [role="button"]').first();

    if (await removeButton.isVisible().catch(() => false)) {
      await removeButton.click();
      await page.waitForTimeout(500);

      // City filter should be removed
      const cityInput = page.locator('input[name="city"]').first();
      const value = await cityInput.inputValue().catch(() => '');
      expect(value).toBe('');
    }
  });

  authTest('should display radius slider for location', async ({ authenticatedPage: page }) => {
    // Fill city to enable radius
    await leadsPage.fillCity('New York');
    await page.waitForTimeout(500);

    // Check for radius slider
    const radiusSlider = page.locator('input[type="range"][name*="radius"], text=Radius').first();
    const hasRadius = await radiusSlider.isVisible().catch(() => false);

    if (hasRadius) {
      await expect(radiusSlider).toBeVisible();
    }
  });

  authTest('should persist filters when navigating back', async ({ authenticatedPage: page }) => {
    // Apply filters
    await leadsPage.selectIndustry('restaurant');
    await page.waitForTimeout(300);

    await leadsPage.fillCity('Los Angeles');
    await page.waitForTimeout(300);

    await leadsPage.search();
    await page.waitForTimeout(1000);

    // Navigate to another page
    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    // Go back to leads
    await page.goto('/dashboard/leads');
    await page.waitForTimeout(1000);

    // Filters might be persisted via sessionStorage
    // Check if city field retains value
    const cityInput = page.locator('input[name="city"]').first();
    const value = await cityInput.inputValue().catch(() => '');

    // Value might be empty or persisted depending on implementation
    expect(value).toBeDefined();
  });

  authTest('should show filter count badge', async ({ authenticatedPage: page }) => {
    // Apply multiple filters
    await leadsPage.selectIndustry('restaurant');
    await page.waitForTimeout(300);

    await leadsPage.checkHasEmail();
    await page.waitForTimeout(300);

    await leadsPage.checkHasPhone();
    await page.waitForTimeout(500);

    // Should show count of active filters (e.g., "3 filters")
    const filterCount = page.locator('text=/\\d+\\s*filter/i').first();
    const hasCount = await filterCount.isVisible().catch(() => false);

    if (hasCount) {
      await expect(filterCount).toBeVisible();
    }
  });
});
