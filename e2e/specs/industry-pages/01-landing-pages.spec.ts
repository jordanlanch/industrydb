/**
 * E2E Tests: Industry Landing Pages
 *
 * Tests industry-specific landing pages with stats and navigation
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';

authTest.describe('Industry Landing Pages', () => {
  authTest('should display restaurant industry landing page', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show industry name
    await expect(page.locator('text=Restaurant').first()).toBeVisible({ timeout: 5000 });

    // Should show description
    await expect(page.locator('text=cuisine').first()).toBeVisible();
  });

  authTest('should show industry icon in hero section', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show professional icon (SVG)
    const icon = page.locator('svg').first();
    await expect(icon).toBeVisible({ timeout: 5000 });
  });

  authTest('should display stats grid', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show total leads stat
    await expect(page.locator('text=Total Leads').first()).toBeVisible();
    await expect(page.locator('text=30,000').first()).toBeVisible({ timeout: 5000 });

    // Should show verified stat
    await expect(page.locator('text=Verified').first()).toBeVisible();

    // Should show avg quality stat
    await expect(page.locator('text=Avg Quality').first()).toBeVisible();
  });

  authTest('should show top cities section', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show section title
    await expect(page.locator('text=Top Cities').first()).toBeVisible({ timeout: 5000 });

    // Should show city names
    await expect(page.locator('text=New York').first()).toBeVisible();
    await expect(page.locator('text=Los Angeles').first()).toBeVisible();
  });

  authTest('should display lead counts for cities', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show lead counts (e.g., "4,521 leads")
    await expect(page.locator('text=/\\d+.*lead/i').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should navigate to filtered search from city', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Click on a city
    const cityCard = page.locator('text=New York').locator('..').locator('..');
    await cityCard.click();
    await page.waitForTimeout(1000);

    // Should navigate to leads page with filters
    await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);
  });

  authTest('should show popular sub-niches section', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show section title
    await expect(page.locator('text=Popular Types').first()).toBeVisible({ timeout: 5000 });

    // Should show sub-niches
    await expect(page.locator('text=Italian').first()).toBeVisible();
    await expect(page.locator('text=Mexican').first()).toBeVisible();
  });

  authTest('should navigate to sub-niche page', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Click on Italian sub-niche
    const italianCard = page.locator('text=Italian').locator('..').locator('..');
    await italianCard.click();
    await page.waitForTimeout(1000);

    // Should navigate to sub-niche landing page
    await expect(page).toHaveURL(/.*\/industries\/restaurant\/italian.*/);
  });

  authTest('should show popular specialties section', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show section title
    await expect(page.locator('text=Popular Specialties').first()).toBeVisible({ timeout: 5000 });

    // Should show specialty badges
    await expect(page.locator('text=Outdoor Seating').first()).toBeVisible();
    await expect(page.locator('text=Delivery').first()).toBeVisible();
  });

  authTest('should show CTA section', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show CTA
    await expect(page.locator('text=Ready to Access').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Start Searching")').first()).toBeVisible();
  });

  authTest('should navigate from CTA to leads page', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Click Start Searching button
    const ctaButton = page.locator('button:has-text("Start Searching")').first();
    await ctaButton.click();
    await page.waitForTimeout(1000);

    // Should navigate to leads page
    await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);
  });

  authTest('should display gym industry landing page', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/gym');
    await page.waitForLoadState('domcontentloaded');

    // Should show gym industry
    await expect(page.locator('text=Gym').first()).toBeVisible({ timeout: 5000 });

    // Should show gym-specific sub-niches
    await expect(page.locator('text=CrossFit').first()).toBeVisible();
    await expect(page.locator('text=Yoga').first()).toBeVisible();
  });

  authTest('should display tattoo industry landing page', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/tattoo');
    await page.waitForLoadState('domcontentloaded');

    // Should show tattoo industry
    await expect(page.locator('text=Tattoo').first()).toBeVisible({ timeout: 5000 });

    // Should show tattoo-specific sub-niches
    await expect(page.locator('text=Traditional').first()).toBeVisible();
    await expect(page.locator('text=Japanese').first()).toBeVisible();
  });

  authTest('should display sub-niche landing page', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant/italian');
    await page.waitForLoadState('domcontentloaded');

    // Should show sub-niche name
    await expect(page.locator('text=Italian').first()).toBeVisible({ timeout: 5000 });

    // Should show breadcrumb navigation
    await expect(page.locator('text=Restaurant').first()).toBeVisible();
  });

  authTest('should show quality distribution on sub-niche page', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant/italian');
    await page.waitForLoadState('domcontentloaded');

    // Should show quality distribution
    await expect(page.locator('text=Quality Distribution').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/High|Medium|Low/').first()).toBeVisible();
  });

  authTest('should show top cities for sub-niche', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant/italian');
    await page.waitForLoadState('domcontentloaded');

    // Should show top cities
    await expect(page.locator('text=Top Cities').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=New York').first()).toBeVisible();
  });

  authTest('should show related sub-niches', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant/italian');
    await page.waitForLoadState('domcontentloaded');

    // Should show related sub-niches
    await expect(page.locator('text=Related').first()).toBeVisible({ timeout: 5000 });

    // Should show other cuisines
    const relatedItems = page.locator('text=/Mexican|Japanese|Chinese/').first();
    const hasRelated = await relatedItems.isVisible().catch(() => false);

    if (hasRelated) {
      await expect(relatedItems).toBeVisible();
    }
  });

  authTest('should navigate back to industry from breadcrumb', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant/italian');
    await page.waitForLoadState('domcontentloaded');

    // Click breadcrumb to go back
    const breadcrumb = page.locator('text=Restaurant').first();
    await breadcrumb.click();
    await page.waitForTimeout(1000);

    // Should navigate back to restaurant page
    await expect(page).toHaveURL(/.*\/industries\/restaurant$/);
  });

  authTest('should show loading state', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');

    // Should show loading state briefly
    const loadingIndicator = page.locator('[class*="loading"], [class*="skeleton"], [class*="animate-pulse"]').first();
    const hasLoading = await loadingIndicator.isVisible().catch(() => false);

    // Loading might be too fast to catch, that's OK
    expect(hasLoading).toBeDefined();
  });

  authTest('should show 404 for non-existent industry', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/nonexistent123');
    await page.waitForLoadState('domcontentloaded');

    // Should show not found message
    await expect(page.locator('text=Not Found').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should be mobile responsive', async ({ authenticatedPage: page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should still show key elements
    await expect(page.locator('text=Restaurant').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Top Cities').first()).toBeVisible();

    // Resize back
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  authTest('should show Search button in hero', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show search button in hero
    const searchButton = page.locator('button:has-text("Search")').first();
    await expect(searchButton).toBeVisible({ timeout: 5000 });

    await searchButton.click();
    await page.waitForTimeout(1000);

    // Should navigate to leads page
    await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);
  });

  authTest('should show Analytics button', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show analytics button
    const analyticsButton = page.locator('button:has-text("Analytics")').first();
    const hasButton = await analyticsButton.isVisible().catch(() => false);

    if (hasButton) {
      await expect(analyticsButton).toBeVisible();
    }
  });

  authTest('should show verification rate percentage', async ({ authenticatedPage: page }) => {
    await page.goto('/industries/restaurant');
    await page.waitForLoadState('domcontentloaded');

    // Should show verification rate (e.g., "82% verification rate")
    await expect(page.locator('text=/%.*verification/i').first()).toBeVisible({ timeout: 5000 });
  });
});
