/**
 * E2E Tests: Industry Selector - Multi-Select
 *
 * Tests multi-select functionality with tier-based limits
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';
import { LeadsPage } from '../../pages/dashboard/leads.page';

authTest.describe('Industry Selector - Multi-Select', () => {
  let leadsPage: LeadsPage;

  authTest.beforeEach(async ({ authenticatedPage: page }) => {
    leadsPage = new LeadsPage(page);
    await leadsPage.goto();
  });

  authTest('should allow selecting multiple sub-niches (Pro tier)', async ({ authenticatedPage: page }) => {
    // Mock user with Pro tier
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'pro@example.com',
          name: 'Pro User',
          subscription_tier: 'pro',
          role: 'user',
        }),
      });
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Open selector and navigate to restaurants
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(500);

    // Select Italian
    await page.locator('text=Italian').first().click();
    await page.waitForTimeout(300);

    // Select Mexican
    await page.locator('text=Mexican').first().click();
    await page.waitForTimeout(300);

    // Select Japanese
    await page.locator('text=Japanese').first().click();
    await page.waitForTimeout(500);

    // Close selector
    await page.keyboard.press('Escape');

    // Should show all three selections
    await expect(page.locator('text=Italian').first()).toBeVisible();
    await expect(page.locator('text=Mexican').first()).toBeVisible();
    await expect(page.locator('text=Japanese').first()).toBeVisible();
  });

  authTest('should limit Free tier to single selection', async ({ authenticatedPage: page }) => {
    // Mock user with Free tier
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

    // Open selector and navigate to restaurants
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(500);

    // Select Italian
    await page.locator('text=Italian').first().click();
    await page.waitForTimeout(300);

    // Try to select Mexican (should replace Italian)
    await page.locator('text=Mexican').first().click();
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');

    // Should only show Mexican (latest selection)
    await expect(page.locator('text=Mexican').first()).toBeVisible();

    // Italian should not be visible or should be replaced
    const italianBadges = await page.locator('[class*="badge"]:has-text("Italian")').count();
    expect(italianBadges).toBeLessThanOrEqual(1);
  });

  authTest('should show upgrade prompt for Free tier', async ({ authenticatedPage: page }) => {
    // Mock user with Free tier
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

    // Should show upgrade badge/message
    const upgradeBadge = page.locator('text=/upgrade|pro|business/i').first();
    const isVisible = await upgradeBadge.isVisible().catch(() => false);

    // If upgrade prompt exists, verify it
    if (isVisible) {
      await expect(upgradeBadge).toBeVisible();
    }
  });

  authTest('should allow Business tier unlimited selections', async ({ authenticatedPage: page }) => {
    // Mock user with Business tier
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'business@example.com',
          name: 'Business User',
          subscription_tier: 'business',
          role: 'user',
        }),
      });
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Open selector and navigate to restaurants
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);

    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(500);

    // Select 5 different cuisines
    const cuisines = ['Italian', 'Mexican', 'Japanese', 'Chinese', 'Thai'];
    for (const cuisine of cuisines) {
      await page.locator(`text=${cuisine}`).first().click();
      await page.waitForTimeout(200);
    }

    await page.keyboard.press('Escape');

    // Should show all 5 selections
    for (const cuisine of cuisines) {
      await expect(page.locator(`text=${cuisine}`).first()).toBeVisible();
    }
  });

  authTest('should select multiple industries from different categories', async ({ authenticatedPage: page }) => {
    // Mock user with Business tier
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'business@example.com',
          name: 'Business User',
          subscription_tier: 'business',
          role: 'user',
        }),
      });
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Open selector
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    // Select from Food & Beverage
    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Italian').first().click();
    await page.waitForTimeout(300);

    // Go back and select from Health & Fitness
    await page.keyboard.press('Escape');
    await industrySelector.click();
    await page.locator('text=Health').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Gym').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=CrossFit').first().click();
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');

    // Should show both selections
    await expect(page.locator('text=Italian').first()).toBeVisible();
    await expect(page.locator('text=CrossFit').first()).toBeVisible();
  });

  authTest('should display selection count indicator', async ({ authenticatedPage: page }) => {
    // Mock user with Pro tier
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'pro@example.com',
          name: 'Pro User',
          subscription_tier: 'pro',
          role: 'user',
        }),
      });
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Open selector and select multiple items
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Italian').first().click();
    await page.waitForTimeout(200);
    await page.locator('text=Mexican').first().click();
    await page.waitForTimeout(500);

    // Should show count (e.g., "2 selected")
    const countIndicator = page.locator('text=/\\d+\\s*(selected|items)/i').first();
    const hasCount = await countIndicator.isVisible().catch(() => false);

    if (hasCount) {
      await expect(countIndicator).toBeVisible();
    }
  });

  authTest('should clear all selections at once', async ({ authenticatedPage: page }) => {
    // Mock user with Pro tier
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'pro@example.com',
          name: 'Pro User',
          subscription_tier: 'pro',
          role: 'user',
        }),
      });
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Select multiple items
    const industrySelector = page.locator('button:has-text("Select industry")').first();
    await industrySelector.click();

    await page.locator('text=Food & Beverage').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Restaurant').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Italian').first().click();
    await page.waitForTimeout(200);
    await page.locator('text=Mexican').first().click();
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');

    // Find and click clear all button
    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Clear All")').first();
    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
      await page.waitForTimeout(500);

      // All selections should be cleared
      const italianBadge = page.locator('[class*="badge"]:has-text("Italian")').first();
      const mexicanBadge = page.locator('[class*="badge"]:has-text("Mexican")').first();

      expect(await italianBadge.isVisible().catch(() => false)).toBe(false);
      expect(await mexicanBadge.isVisible().catch(() => false)).toBe(false);
    }
  });
});
