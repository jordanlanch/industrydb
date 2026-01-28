/**
 * E2E Tests: Saved Searches - Create and List
 *
 * Tests creating and listing saved searches
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';
import { LeadsPage } from '../../pages/dashboard/leads.page';
import { SavedSearchesPage } from '../../pages/dashboard/saved-searches.page';

authTest.describe('Saved Searches - Create and List', () => {
  let leadsPage: LeadsPage;
  let savedSearchesPage: SavedSearchesPage;

  authTest.beforeEach(async ({ authenticatedPage: page }) => {
    leadsPage = new LeadsPage(page);
    savedSearchesPage = new SavedSearchesPage(page);
  });

  authTest('should display saved searches page correctly', async ({ authenticatedPage: page }) => {
    await savedSearchesPage.goto();
    await savedSearchesPage.expectPageLoaded();
  });

  authTest('should show empty state when no saved searches', async ({ authenticatedPage: page }) => {
    // Mock empty API response
    await page.route('**/api/v1/saved-searches', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ searches: [], count: 0 }),
      });
    });

    await savedSearchesPage.goto();
    await savedSearchesPage.expectEmptyState();
  });

  authTest('should create a saved search from leads page', async ({ authenticatedPage: page }) => {
    // Mock create API response
    await page.route('**/api/v1/saved-searches', async (route) => {
      if (route.request().method() === 'POST') {
        const postData = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            user_id: 1,
            name: postData.name,
            filters: postData.filters,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      }
    });

    // Go to leads page and apply filters
    await leadsPage.goto();
    await leadsPage.selectIndustry('restaurant');
    await leadsPage.fillCity('New York');

    // Save the search
    await savedSearchesPage.openSaveDialog();
    await savedSearchesPage.fillSearchName('NYC Restaurants');
    await savedSearchesPage.clickSave();

    // Should show success message
    await expect(page.locator('text=saved successfully').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should list saved searches', async ({ authenticatedPage: page }) => {
    // Mock list API response
    await page.route('**/api/v1/saved-searches', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            searches: [
              {
                id: 1,
                user_id: 1,
                name: 'NYC Restaurants',
                filters: { industry: 'restaurant', city: 'New York' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: 2,
                user_id: 1,
                name: 'LA Gyms',
                filters: { industry: 'gym', city: 'Los Angeles' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
            count: 2,
          }),
        });
      }
    });

    await savedSearchesPage.goto();

    // Should display both searches
    await savedSearchesPage.expectSearchExists('NYC Restaurants');
    await savedSearchesPage.expectSearchExists('LA Gyms');

    const count = await savedSearchesPage.getSavedSearchesCount();
    expect(count).toBe(2);
  });

  authTest('should show error when saving without name', async ({ authenticatedPage: page }) => {
    await leadsPage.goto();
    await leadsPage.selectIndustry('restaurant');

    await savedSearchesPage.openSaveDialog();
    // Don't fill name
    await savedSearchesPage.clickSave();

    // Should show validation error
    await expect(page.locator('text=required').first()).toBeVisible({ timeout: 5000 });
  });

  authTest('should show error when saving duplicate name', async ({ authenticatedPage: page }) => {
    // Mock duplicate name error
    await page.route('**/api/v1/saved-searches', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'A saved search with this name already exists',
          }),
        });
      }
    });

    await leadsPage.goto();
    await leadsPage.selectIndustry('restaurant');

    await savedSearchesPage.openSaveDialog();
    await savedSearchesPage.fillSearchName('Existing Search');
    await savedSearchesPage.clickSave();

    // Should show error message
    await savedSearchesPage.expectErrorMessage('already exists');
  });

  authTest('should display search filters in saved search card', async ({ authenticatedPage: page }) => {
    // Mock list API response
    await page.route('**/api/v1/saved-searches', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            searches: [
              {
                id: 1,
                user_id: 1,
                name: 'NYC Italian Restaurants',
                filters: {
                  industry: 'restaurant',
                  sub_niche: 'italian',
                  city: 'New York',
                  has_email: true,
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
            count: 1,
          }),
        });
      }
    });

    await savedSearchesPage.goto();
    await savedSearchesPage.expectSearchExists('NYC Italian Restaurants');

    // Should display filter badges
    await expect(page.locator('text=restaurant').first()).toBeVisible();
    await expect(page.locator('text=New York').first()).toBeVisible();
  });

  authTest('should show action buttons on saved search', async ({ authenticatedPage: page }) => {
    // Mock list API response
    await page.route('**/api/v1/saved-searches', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            searches: [
              {
                id: 1,
                user_id: 1,
                name: 'Test Search',
                filters: { industry: 'restaurant' },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
            count: 1,
          }),
        });
      }
    });

    await savedSearchesPage.goto();
    await savedSearchesPage.expectSearchExists('Test Search');

    // Should show Run Search and Delete buttons
    await savedSearchesPage.expectRunButtonVisible('Test Search');
    await savedSearchesPage.expectDeleteButtonVisible('Test Search');
  });
});
