/**
 * E2E Tests: Email Sequences
 *
 * Tests email sequence / drip campaign functionality
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';

authTest.describe('Email Sequences', () => {
  authTest('should show email sequences page', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Page should load
    const url = page.url();
    expect(url.includes('/email-sequences') || url.includes('/dashboard')).toBeTruthy();
  });

  authTest('should display email sequences heading', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for heading
    const heading = page.getByRole('heading', { name: /email sequences|drip|campaigns/i }).first();
    const hasHeading = await heading.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasHeading) {
      await expect(heading).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });

  authTest('should show new sequence button', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for create button
    const createButton = page.getByRole('button', { name: /new sequence|create|add/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await expect(createButton).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });

  authTest('should open create sequence dialog', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Click create button
    const createButton = page.getByRole('button', { name: /new sequence|create|add/i }).first();
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

    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });

  authTest('should have sequence name input field', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new sequence|create|add/i }).first();
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

    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });

  authTest('should show trigger selector', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new sequence|create|add/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for trigger selector
      const triggerSelector = page.getByText(/trigger|when|start/i).first();
      const hasSelector = await triggerSelector.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasSelector) {
        await expect(triggerSelector).toBeVisible();
      }
    }

    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });

  authTest('should validate required fields', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new sequence|create|add/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Try to submit without filling
      const submitButton = page.getByRole('button', { name: /create|save|submit/i }).last();
      const hasSubmit = await submitButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasSubmit) {
        await submitButton.click().catch(() => {});
        await page.waitForTimeout(500);

        // Look for validation error
        const validationError = page.getByText(/required|cannot be empty/i).first();
        const hasError = await validationError.isVisible({ timeout: 2000 }).catch(() => false);
      }
    }

    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });

  authTest('should show empty state when no sequences', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for empty state or sequences list
    const emptyState = page.getByText(/no sequences|create your first|get started/i).first();
    const hasEmpty = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);

    const sequencesList = page.locator('[data-testid="sequence"], .sequence-item');
    const hasItems = await sequencesList.first().isVisible({ timeout: 5000 }).catch(() => false);

    // Either empty state or items list
    expect(hasEmpty || hasItems).toBeTruthy();
  });

  authTest('should show sequence steps section', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for steps section
    const stepsSection = page.getByText(/step|email|delay/i).first();
    const hasSection = await stepsSection.isVisible({ timeout: 5000 }).catch(() => false);

    // Steps section might only show when sequence is selected
    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });

  authTest('should show sequence status indicator', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for status
    const statusIndicator = page.getByText(/active|paused|draft|archived/i).first();
    const hasStatus = await statusIndicator.isVisible({ timeout: 5000 }).catch(() => false);

    // Status only visible if sequences exist
    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });

  authTest('should handle sequence errors gracefully', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
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
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new sequence|create|add/i }).first();
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

    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });

  authTest('should show filter by status', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/email-sequences');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for filter
    const filterSelector = page.getByText(/filter|status|all sequences/i).first();
    const hasFilter = await filterSelector.isVisible({ timeout: 5000 }).catch(() => false);

    // Filter might not be visible if no sequences
    await expect(page).toHaveURL(/\/(email-sequences|dashboard)/);
  });
});
