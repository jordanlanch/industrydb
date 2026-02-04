/**
 * E2E Tests: Saved Searches - Run and Delete
 *
 * Tests running and deleting saved searches
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';
import { LeadsPage } from '../../pages/dashboard/leads.page';
import { SavedSearchesPage } from '../../pages/dashboard/saved-searches.page';
import { mockLeadsResponse, generateSampleLeads } from '../../fixtures/api-helpers';

authTest.describe('Saved Searches - Run and Delete', () => {
  let leadsPage: LeadsPage;
  let savedSearchesPage: SavedSearchesPage;

  authTest.beforeEach(async ({ authenticatedPage: page }) => {
    leadsPage = new LeadsPage(page);
    savedSearchesPage = new SavedSearchesPage(page);

    // Mock saved searches list
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
                filters: { industry: 'gym', city: 'Los Angeles', has_email: true },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
            count: 2,
          }),
        });
      }
    });
  });

  authTest('should run a saved search', async ({ authenticatedPage: page }) => {
    // Mock leads search response
    await mockLeadsResponse(page, generateSampleLeads(5));

    await savedSearchesPage.goto();
    await savedSearchesPage.expectSearchExists('NYC Restaurants');

    // Click Run Search
    await savedSearchesPage.runSearch('NYC Restaurants');

    // Should redirect to leads page with filters applied
    await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);
    await leadsPage.expectPageLoaded();

    // Filters should be applied (check via URL or page state)
    await page.waitForTimeout(1000);
    const count = await leadsPage.getResultsCount();
    expect(count).toBeGreaterThan(0);
  });

  authTest('should apply filters when running saved search', async ({ authenticatedPage: page }) => {
    // Mock leads search response
    await mockLeadsResponse(page, generateSampleLeads(3));

    await savedSearchesPage.goto();
    await savedSearchesPage.runSearch('LA Gyms');

    // Should redirect to leads page
    await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);

    // Wait for search to execute
    await page.waitForTimeout(1500);

    // Should show results
    const count = await leadsPage.getResultsCount();
    expect(count).toBeGreaterThan(0);
  });

  authTest('should delete a saved search', async ({ authenticatedPage: page }) => {
    // Mock delete API response
    await page.route('**/api/v1/saved-searches/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Saved search deleted successfully',
          }),
        });
      }
    });

    // Mock updated list after deletion
    let deleteTriggered = false;
    await page.route('**/api/v1/saved-searches', async (route) => {
      if (route.request().method() === 'GET') {
        if (deleteTriggered) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              searches: [
                {
                  id: 2,
                  user_id: 1,
                  name: 'LA Gyms',
                  filters: { industry: 'gym', city: 'Los Angeles' },
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
              count: 1,
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              searches: [
                {
                  id: 1,
                  user_id: 1,
                  name: 'NYC Restaurants',
                  filters: { industry: 'restaurant' },
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                {
                  id: 2,
                  user_id: 1,
                  name: 'LA Gyms',
                  filters: { industry: 'gym' },
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
              count: 2,
            }),
          });
        }
      }
    });

    await savedSearchesPage.goto();
    await savedSearchesPage.expectSearchExists('NYC Restaurants');
    await savedSearchesPage.expectSearchExists('LA Gyms');

    // Delete first search
    deleteTriggered = true;
    await savedSearchesPage.deleteSearch('NYC Restaurants');

    // Should show success message
    await expect(page.locator('text=deleted successfully').first()).toBeVisible({ timeout: 5000 });

    // Refresh page to see updated list
    await page.reload();
    await page.waitForTimeout(1000);

    // NYC Restaurants should be gone
    await savedSearchesPage.expectSearchNotExists('NYC Restaurants');
    await savedSearchesPage.expectSearchExists('LA Gyms');
  });

  authTest('should show confirmation dialog before deletion', async ({ authenticatedPage: page }) => {
    await savedSearchesPage.goto();
    await savedSearchesPage.expectSearchExists('NYC Restaurants');

    // Click delete button
    const searchCard = page.locator('text=NYC Restaurants').locator('..').locator('..');
    const deleteButton = searchCard.locator('button:has-text("Delete"), button[aria-label*="Delete"]');
    await deleteButton.click();

    // Should show confirmation dialog
    await expect(page.locator('text=Are you sure').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Cancel"), button:has-text("Confirm")').first()).toBeVisible();
  });

  authTest('should cancel deletion when clicking cancel', async ({ authenticatedPage: page }) => {
    await savedSearchesPage.goto();
    await savedSearchesPage.expectSearchExists('NYC Restaurants');

    // Click delete button
    const searchCard = page.locator('text=NYC Restaurants').locator('..').locator('..');
    const deleteButton = searchCard.locator('button:has-text("Delete"), button[aria-label*="Delete"]');
    await deleteButton.click();

    // Click cancel
    const cancelButton = page.locator('button:has-text("Cancel")').last();
    await cancelButton.click();

    // Search should still exist
    await savedSearchesPage.expectSearchExists('NYC Restaurants');
  });

  authTest('should show error when deletion fails', async ({ authenticatedPage: page }) => {
    // Mock delete API error
    await page.route('**/api/v1/saved-searches/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Failed to delete saved search',
          }),
        });
      }
    });

    await savedSearchesPage.goto();
    await savedSearchesPage.deleteSearch('NYC Restaurants');

    // Should show error message
    await savedSearchesPage.expectErrorMessage('Failed');
  });

  authTest('should navigate back to leads page from saved searches', async ({ authenticatedPage: page }) => {
    await savedSearchesPage.goto();
    await savedSearchesPage.goToLeadsPage();

    // Should be on leads page
    await expect(page).toHaveURL(/.*\/dashboard\/leads.*/);
    await leadsPage.expectPageLoaded();
  });

  authTest('should show recent searches on dashboard', async ({ authenticatedPage: page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Should show Recent Searches widget
    await expect(page.locator('text=Recent Searches').first()).toBeVisible({ timeout: 5000 });
  });
});
