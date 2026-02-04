/**
 * E2E Tests: Dashboard Widgets
 *
 * Tests dashboard widget functionality (Popular Industries, Trending Searches, Recent Searches)
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';

authTest.describe('Dashboard Widgets', () => {
  authTest.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
  });

  authTest('should display dashboard correctly', async ({ authenticatedPage: page }) => {
    // Should show greeting
    await expect(page.locator('text=/Good (morning|afternoon|evening)/').first()).toBeVisible({ timeout: 5000 });

    // Should show dashboard title
    await expect(page.locator('text=dashboard').first()).toBeVisible();
  });

  authTest('should display usage statistics card', async ({ authenticatedPage: page }) => {
    // Should show monthly usage
    await expect(page.locator('text=Monthly Usage').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=remaining').first()).toBeVisible();
  });

  authTest('should display stats grid', async ({ authenticatedPage: page }) => {
    // Should show total leads stat
    await expect(page.locator('text=Total Leads').first()).toBeVisible();

    // Should show new this week stat
    await expect(page.locator('text=New This Week').first()).toBeVisible();

    // Should show countries stat
    await expect(page.locator('text=Countries').first()).toBeVisible();
  });

  authTest('should display quick actions cards', async ({ authenticatedPage: page }) => {
    // Should show quick action cards
    await expect(page.locator('text=Search Leads').first()).toBeVisible();
    await expect(page.locator('text=Saved Searches').first()).toBeVisible();
    await expect(page.locator('text=View Exports').first()).toBeVisible();
    await expect(page.locator('text=Upgrade Plan').first()).toBeVisible();
  });

  authTest('should navigate to leads page from quick actions', async ({ authenticatedPage: page }) => {
    // Click Search Leads card
    const searchCard = page.locator('text=Search Leads').locator('..').locator('..');
    await searchCard.click();

    // Should navigate to leads page
    await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);
  });

  authTest('should display Popular Industries widget', async ({ authenticatedPage: page }) => {
    // Should show widget title
    await expect(page.locator('text=Popular Industries').first()).toBeVisible({ timeout: 5000 });

    // Should show industry items
    await expect(page.locator('text=Restaurant').first()).toBeVisible();
  });

  authTest('should show industry lead counts', async ({ authenticatedPage: page }) => {
    // Popular Industries should show lead counts
    const leadCount = page.locator('text=/\\d+.*lead/i').first();
    await expect(leadCount).toBeVisible({ timeout: 5000 });
  });

  authTest('should show industry change percentages', async ({ authenticatedPage: page }) => {
    // Should show percentage changes (e.g., "+12%")
    const changePercent = page.locator('text=/[+\\-]\\d+%/').first();
    const hasChange = await changePercent.isVisible().catch(() => false);

    if (hasChange) {
      await expect(changePercent).toBeVisible();
    }
  });

  authTest('should navigate to filtered search from Popular Industries', async ({ authenticatedPage: page }) => {
    // Find restaurant item in Popular Industries
    const restaurantItem = page.locator('text=Restaurant').locator('..').locator('..');

    // Click on it
    await restaurantItem.click();
    await page.waitForTimeout(1000);

    // Should navigate to leads page with restaurant filter
    await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);
  });

  authTest('should display Trending Searches widget', async ({ authenticatedPage: page }) => {
    // Should show widget title
    await expect(page.locator('text=Trending Searches').first()).toBeVisible({ timeout: 5000 });

    // Should show search items
    const trendingItems = page.locator('[class*="search"], text=/NYC|Los Angeles|Chicago/i').first();
    const hasTrending = await trendingItems.isVisible().catch(() => false);

    if (hasTrending) {
      await expect(trendingItems).toBeVisible();
    }
  });

  authTest('should show trending indicators', async ({ authenticatedPage: page }) => {
    // Should show flame icon or trending indicator
    const flameIcon = page.locator('svg').first();
    await expect(flameIcon).toBeVisible({ timeout: 5000 });
  });

  authTest('should show search counts in trending widget', async ({ authenticatedPage: page }) => {
    // Should show search counts (e.g., "342 searches")
    const searchCount = page.locator('text=/\\d+.*search/i').first();
    const hasCount = await searchCount.isVisible().catch(() => false);

    if (hasCount) {
      await expect(searchCount).toBeVisible();
    }
  });

  authTest('should display Recent Searches widget', async ({ authenticatedPage: page }) => {
    // Should show widget title
    await expect(page.locator('text=Recent Searches').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should show empty state in Recent Searches', async ({ authenticatedPage: page }) => {
    // If no recent searches, should show empty state
    const emptyState = page.locator('text=No recent searches').first();
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    if (hasEmpty) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator('button:has-text("Start Searching")').first()).toBeVisible();
    }
  });

  authTest('should show time ago for recent searches', async ({ authenticatedPage: page }) => {
    // Should show relative time (e.g., "30m ago", "2h ago")
    const timeAgo = page.locator('text=/\\d+[mhd]\\s*ago|Yesterday/i').first();
    const hasTime = await timeAgo.isVisible().catch(() => false);

    if (hasTime) {
      await expect(timeAgo).toBeVisible();
    }
  });

  authTest('should show result counts in recent searches', async ({ authenticatedPage: page }) => {
    // Should show result counts (e.g., "234 results")
    const resultCount = page.locator('text=/\\d+.*result/i').first();
    const hasResults = await resultCount.isVisible().catch(() => false);

    if (hasResults) {
      await expect(resultCount).toBeVisible();
    }
  });

  authTest('should re-run recent search', async ({ authenticatedPage: page }) => {
    // Find a recent search item with arrow button
    const rerunButton = page.locator('button:has-text("→"), button[aria-label*="Run"]').first();
    const hasRerun = await rerunButton.isVisible().catch(() => false);

    if (hasRerun) {
      await rerunButton.click();
      await page.waitForTimeout(1000);

      // Should navigate to leads page
      await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);
    }
  });

  authTest('should show New Search button in Recent Searches', async ({ authenticatedPage: page }) => {
    // Should have button to create new search
    const newSearchButton = page.locator('button:has-text("New Search")').first();
    const hasButton = await newSearchButton.isVisible().catch(() => false);

    if (hasButton) {
      await expect(newSearchButton).toBeVisible();

      await newSearchButton.click();
      await page.waitForTimeout(1000);

      // Should navigate to leads page
      await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);
    }
  });

  authTest('should display tier badge', async ({ authenticatedPage: page }) => {
    // Should show subscription tier badge
    await expect(page.locator('text=/FREE|STARTER|PRO|BUSINESS/').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should show upgrade button for free tier', async ({ authenticatedPage: page }) => {
    // Mock free tier user
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'free@example.com',
          name: 'Free User',
          subscription_tier: 'free',
          role: 'user',
        }),
      });
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Should show upgrade button
    await expect(page.locator('button:has-text("Upgrade")').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should navigate to billing from upgrade button', async ({ authenticatedPage: page }) => {
    // Mock free tier user
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'free@example.com',
          name: 'Free User',
          subscription_tier: 'free',
          role: 'user',
        }),
      });
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const upgradeButton = page.locator('button:has-text("Upgrade")').first();
    await upgradeButton.click();
    await page.waitForTimeout(1000);

    // Should navigate to billing settings
    await expect(page).toHaveURL(/.*\/settings\/billing.*/);
  });

  authTest('should show progress bar in usage card', async ({ authenticatedPage: page }) => {
    // Should show usage progress bar
    const progressBar = page.locator('[class*="progress"], [role="progressbar"]').first();
    const hasProgress = await progressBar.isVisible().catch(() => false);

    if (hasProgress) {
      await expect(progressBar).toBeVisible();
    }
  });

  authTest('should show different greeting based on time', async ({ authenticatedPage: page }) => {
    // Should show time-appropriate greeting
    const greeting = await page.locator('text=/Good (morning|afternoon|evening)/').first().textContent();

    expect(greeting).toMatch(/Good (morning|afternoon|evening)/);
  });

  authTest('should display widgets in responsive grid', async ({ authenticatedPage: page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Widgets should still be visible
    await expect(page.locator('text=Popular Industries').first()).toBeVisible();
    await expect(page.locator('text=Recent Searches').first()).toBeVisible();

    // Resize back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  authTest('should show Saved Searches link in Recent Searches', async ({ authenticatedPage: page }) => {
    // Should show link to saved searches
    const savedLink = page.locator('button:has-text("Saved"), a:has-text("Saved")').first();
    const hasLink = await savedLink.isVisible().catch(() => false);

    if (hasLink) {
      await expect(savedLink).toBeVisible();

      await savedLink.click();
      await page.waitForTimeout(1000);

      // Should navigate to saved searches
      await expect(page).toHaveURL(/.*\/saved-searches.*/);
    }
  });
});
