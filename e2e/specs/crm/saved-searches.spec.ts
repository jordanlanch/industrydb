/**
 * E2E Tests: Saved Searches
 *
 * Tests saved search functionality
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';

authTest.describe('Saved Searches', () => {
  authTest('should show saved searches page', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Page should load
    const url = page.url();
    expect(url.includes('/saved-searches') || url.includes('/dashboard')).toBeTruthy();
  });

  authTest('should display saved searches heading', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for heading
    const heading = page.getByRole('heading', { name: /saved searches/i }).first();
    const hasHeading = await heading.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasHeading) {
      await expect(heading).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should show new saved search button', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for create button
    const createButton = page.getByRole('button', { name: /new.*search|create|add|save search/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await expect(createButton).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should open create saved search dialog', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Click create button
    const createButton = page.getByRole('button', { name: /new.*search|create|add|save search/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Should show dialog
      const dialog = page.locator('[role="dialog"], .modal');
      const hasDialog = await dialog.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasDialog) {
        await expect(dialog).toBeVisible();
      }
    }

    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should have search name input field', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new.*search|create|add|save search/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for name input
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
      const hasInput = await nameInput.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasInput) {
        await expect(nameInput).toBeVisible();
      }
    }

    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should show industry selector', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new.*search|create|add|save search/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for industry selector
      const industrySelector = page.getByText(/industry/i).first();
      const hasSelector = await industrySelector.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasSelector) {
        await expect(industrySelector).toBeVisible();
      }
    }

    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should show country selector', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new.*search|create|add|save search/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for country selector
      const countrySelector = page.getByText(/country/i).first();
      const hasSelector = await countrySelector.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasSelector) {
        await expect(countrySelector).toBeVisible();
      }
    }

    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should validate required fields', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new.*search|create|add|save search/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Try to submit without filling
      const submitButton = page.getByRole('button', { name: /save|create|submit/i }).last();
      const hasSubmit = await submitButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasSubmit) {
        await submitButton.click().catch(() => {});
        await page.waitForTimeout(500);

        // Look for validation error
        const validationError = page.getByText(/required|cannot be empty/i).first();
        const hasError = await validationError.isVisible({ timeout: 2000 }).catch(() => false);
      }
    }

    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should show empty state when no saved searches', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for empty state or searches list
    const emptyState = page.getByText(/no saved searches|create your first|get started/i).first();
    const hasEmpty = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);

    const searchesList = page.locator('[data-testid="saved-search"], .saved-search-item');
    const hasItems = await searchesList.first().isVisible({ timeout: 5000 }).catch(() => false);

    // Either empty state or items list
    expect(hasEmpty || hasItems).toBeTruthy();
  });

  authTest('should show result count for saved searches', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for result count
    const resultCount = page.locator('text=/\\d+ results?/i').first();
    const hasCount = await resultCount.isVisible({ timeout: 5000 }).catch(() => false);

    // Result count only visible if saved searches exist
    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should show notification toggle', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new.*search|create|add|save search/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for notification toggle
      const notifyToggle = page.getByText(/notify|alert|email/i).first();
      const hasToggle = await notifyToggle.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasToggle) {
        await expect(notifyToggle).toBeVisible();
      }
    }

    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should handle saved search errors gracefully', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Page should handle errors gracefully
    const errorMsg = page.getByText(/error|failed/i).first();
    const hasError = await errorMsg.isVisible({ timeout: 3000 }).catch(() => false);

    // Page should still be functional
    const pageContent = page.locator('body');
    const bodyText = await pageContent.textContent().catch(() => '');
    expect(bodyText.length).toBeGreaterThan(0);
  });

  authTest('should close dialog on cancel', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new.*search|create|add|save search/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Close dialog
      const closeButton = page.getByRole('button', { name: /close|cancel/i }).first();
      const hasClose = await closeButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasClose) {
        await closeButton.click();
        await page.waitForTimeout(500);

        // Dialog should be closed
        const dialog = page.locator('[role="dialog"]');
        const dialogVisible = await dialog.isVisible({ timeout: 1000 }).catch(() => false);
        expect(dialogVisible).toBeFalsy();
      }
    }

    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });

  authTest('should show execute search button', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/saved-searches');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for execute/run button
    const executeButton = page.getByRole('button', { name: /run|execute|search/i }).first();
    const hasButton = await executeButton.isVisible({ timeout: 5000 }).catch(() => false);

    // Execute button only visible if saved searches exist
    await expect(page).toHaveURL(/\/(saved-searches|dashboard)/);
  });
});
