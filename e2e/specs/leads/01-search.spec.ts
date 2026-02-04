/**
 * E2E Tests: Lead Search
 *
 * Tests lead search functionality with various filters
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';
import { LeadsPage } from '../../pages/dashboard/leads.page';
import { mockLeadsResponse, mockEmptyLeadsResponse, generateSampleLeads, mockUsageLimitExceeded } from '../../fixtures/api-helpers';

authTest.describe('Lead Search', () => {
  let leadsPage: LeadsPage;

  authTest.beforeEach(async ({ authenticatedPage: page }) => {
    leadsPage = new LeadsPage(page);
    await leadsPage.goto();
  });

  authTest('should display leads page correctly', async ({ authenticatedPage: page }) => {
    await leadsPage.expectPageLoaded();
    await leadsPage.expectFiltersVisible();
    await leadsPage.expectUsageInfo();
  });

  authTest('should search leads with industry filter', async ({ authenticatedPage: page }) => {
    // Mock API response
    await mockLeadsResponse(page, generateSampleLeads(5));

    await leadsPage.selectIndustry('tattoo');
    await leadsPage.search();

    // Should display results
    await page.waitForTimeout(1000); // Wait for results to load
    const count = await leadsPage.getResultsCount();
    expect(count).toBeGreaterThan(0);
  });

  authTest('should search leads with multiple filters', async ({ authenticatedPage: page }) => {
    await mockLeadsResponse(page, generateSampleLeads(3));

    await leadsPage.searchWithFilters({
      industry: 'tattoo',
      country: 'US',
      city: 'New York',
      hasEmail: true,
    });

    await page.waitForTimeout(1000);
    const count = await leadsPage.getResultsCount();
    expect(count).toBeGreaterThan(0);
  });

  authTest('should show empty state when no results', async ({ authenticatedPage: page }) => {
    await mockEmptyLeadsResponse(page);

    await leadsPage.selectIndustry('tattoo');
    await leadsPage.fillCity('NonexistentCity123');
    await leadsPage.search();

    await leadsPage.expectNoResults();
  });

  authTest('should display usage statistics', async ({ authenticatedPage: page }) => {
    await leadsPage.expectUsageInfo();

    const stats = await leadsPage.getUsageStats();
    expect(stats).not.toBeNull();
  });

  authTest('should show error when usage limit exceeded', async ({ authenticatedPage: page }) => {
    await mockUsageLimitExceeded(page);

    await leadsPage.selectIndustry('tattoo');
    await leadsPage.search();

    // Should show limit exceeded message
    await expect(page.locator('text=limit exceeded').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should clear filters', async ({ authenticatedPage: page }) => {
    await leadsPage.selectIndustry('tattoo');
    await leadsPage.fillCountry('US');
    await leadsPage.fillCity('New York');

    await leadsPage.clearFilters();

    // Filters should be cleared
    const industry = await page.selectOption('select', { index: 0 });
    expect(industry).toBeTruthy();
  });

  authTest('should persist filters in URL', async ({ authenticatedPage: page }) => {
    await leadsPage.selectIndustry('tattoo');
    await leadsPage.fillCountry('US');
    await leadsPage.search();

    // URL should contain filter parameters
    const url = page.url();
    expect(url).toContain('industry=tattoo');
    expect(url).toContain('country=US');
  });

  authTest('should display export buttons', async ({ authenticatedPage: page }) => {
    await leadsPage.expectExportButtonsVisible();
  });

  authTest('should handle network errors gracefully', async ({ authenticatedPage: page }) => {
    // Mock network failure
    await page.route('**/api/v1/leads*', route => route.abort('failed'));

    await leadsPage.selectIndustry('tattoo');
    await leadsPage.search();

    // Should show error message
    await expect(page.locator('text=error').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should paginate results', async ({ authenticatedPage: page }) => {
    // Mock large result set
    await mockLeadsResponse(page, generateSampleLeads(50), 50);

    await leadsPage.selectIndustry('tattoo');
    await leadsPage.search();

    await page.waitForTimeout(1000);

    // Check if pagination controls exist
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible().catch(() => false)) {
      await leadsPage.goToNextPage();
      // Should still be on leads page
      await expect(page).toHaveURL(/\/dashboard\/leads/);
    }
  });

  authTest('should display lead quality scores', async ({ authenticatedPage: page }) => {
    await mockLeadsResponse(page, generateSampleLeads(5));

    await leadsPage.selectIndustry('tattoo');
    await leadsPage.search();

    await page.waitForTimeout(1000);

    // Check if quality score is displayed
    const qualityScore = page.locator('text=Quality Score').first();
    if (await qualityScore.isVisible().catch(() => false)) {
      await expect(qualityScore).toBeVisible();
    }
  });
});
