import { test, expect } from '@playwright/test';

test.describe('Leads Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.goto('/register');
    await page.fill('input[id="name"]', 'Leads Test User');
    await page.fill('input[id="email"]', email);
    await page.fill('input[id="password"]', 'password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display leads search page', async ({ page }) => {
    await expect(page.locator('text=Search Leads')).toBeVisible();
    await expect(page.locator('text=Filters')).toBeVisible();
    await expect(page.locator('text=Results')).toBeVisible();
  });

  test('should display usage information', async ({ page }) => {
    await expect(page.locator('text=Usage')).toBeVisible();
    await expect(page.locator('text=Leads accessed this month')).toBeVisible();
    await expect(page.locator('text=remaining')).toBeVisible();
  });

  test('should have filter options', async ({ page }) => {
    await expect(page.locator('label:has-text("Industry")')).toBeVisible();
    await expect(page.locator('label:has-text("Country")')).toBeVisible();
    await expect(page.locator('label:has-text("City")')).toBeVisible();
    await expect(page.locator('label:has-text("Has Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Has Phone")')).toBeVisible();
  });

  test('should filter by industry', async ({ page }) => {
    // Select tattoo industry
    await page.selectOption('select', 'tattoo');
    await page.click('button:has-text("Search")');

    // Wait for results
    await page.waitForTimeout(2000);

    // Should display results or "no leads" message
    const hasResults = await page.locator('text=Quality Score').isVisible().catch(() => false);
    const noResults = await page.locator('text=No leads found').isVisible().catch(() => false);

    expect(hasResults || noResults).toBeTruthy();
  });

  test('should display export buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Export CSV")')).toBeVisible();
    await expect(page.locator('button:has-text("Export Excel")')).toBeVisible();
  });

  test('should search leads successfully', async ({ page }) => {
    await page.click('button:has-text("Search")');

    // Wait for search to complete
    await page.waitForTimeout(2000);

    // Should show results count
    await expect(page.locator('text=Results')).toBeVisible();
  });
});
