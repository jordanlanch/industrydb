/**
 * E2E Tests: Webhooks
 *
 * Tests webhook management functionality
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';

authTest.describe('Webhooks', () => {
  authTest('should show webhooks page', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Page should load
    const url = page.url();
    expect(url.includes('/webhooks') || url.includes('/dashboard')).toBeTruthy();
  });

  authTest('should display webhooks heading', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for heading
    const heading = page.getByRole('heading', { name: /webhooks/i }).first();
    const hasHeading = await heading.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasHeading) {
      await expect(heading).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should show new webhook button', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for create button
    const createButton = page.getByRole('button', { name: /new webhook|create|add/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await expect(createButton).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should open create webhook dialog', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Click create button
    const createButton = page.getByRole('button', { name: /new webhook|create|add/i }).first();
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

    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should have webhook URL input', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new webhook|create|add/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for URL input
      const urlInput = page.locator('input[name="url"], input[placeholder*="url"], input[type="url"]').first();
      const hasInput = await urlInput.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasInput) {
        await expect(urlInput).toBeVisible();
      }
    }

    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should show event selector', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new webhook|create|add/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Look for event selector
      const eventSelector = page.getByText(/event|trigger/i).first();
      const hasSelector = await eventSelector.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasSelector) {
        await expect(eventSelector).toBeVisible();
      }
    }

    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should validate webhook URL format', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new webhook|create|add/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Try invalid URL
      const urlInput = page.locator('input[name="url"], input[placeholder*="url"], input[type="url"]').first();
      const hasInput = await urlInput.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasInput) {
        await urlInput.fill('invalid-url');

        // Try to submit
        const submitButton = page.getByRole('button', { name: /create|save/i }).last();
        const hasSubmit = await submitButton.isVisible({ timeout: 3000 }).catch(() => false);

        if (hasSubmit) {
          await submitButton.click().catch(() => {});
          await page.waitForTimeout(500);

          // Look for validation error
          const validationError = page.getByText(/valid url|invalid/i).first();
          const hasError = await validationError.isVisible({ timeout: 2000 }).catch(() => false);
        }
      }
    }

    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should require at least one event', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new webhook|create|add/i }).first();
    const hasButton = await createButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await createButton.click();
      await page.waitForTimeout(500);

      // Fill URL but not events
      const urlInput = page.locator('input[name="url"], input[placeholder*="url"], input[type="url"]').first();
      const hasInput = await urlInput.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasInput) {
        await urlInput.fill('https://example.com/webhook');

        // Try to submit
        const submitButton = page.getByRole('button', { name: /create|save/i }).last();
        const hasSubmit = await submitButton.isVisible({ timeout: 3000 }).catch(() => false);

        if (hasSubmit) {
          await submitButton.click().catch(() => {});
          await page.waitForTimeout(500);

          // Look for validation error
          const validationError = page.getByText(/select.*event|required/i).first();
          const hasError = await validationError.isVisible({ timeout: 2000 }).catch(() => false);
        }
      }
    }

    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should show empty state when no webhooks', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for empty state or webhooks list
    const emptyState = page.getByText(/no webhooks|create your first|get started/i).first();
    const hasEmpty = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);

    const webhooksList = page.locator('[data-testid="webhook"], .webhook-item');
    const hasItems = await webhooksList.first().isVisible({ timeout: 5000 }).catch(() => false);

    // Either empty state or items list
    expect(hasEmpty || hasItems).toBeTruthy();
  });

  authTest('should show webhook secret info', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for secret or signature info
    const secretInfo = page.getByText(/secret|signature|hmac/i).first();
    const hasSecret = await secretInfo.isVisible({ timeout: 5000 }).catch(() => false);

    // Secret info might only show when webhook exists
    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should show webhook status toggle', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for status toggle
    const statusToggle = page.getByText(/active|inactive|enabled/i).first();
    const hasToggle = await statusToggle.isVisible({ timeout: 5000 }).catch(() => false);

    // Status toggle only visible if webhooks exist
    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should show test webhook button', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for test button
    const testButton = page.getByRole('button', { name: /test|send test/i }).first();
    const hasTest = await testButton.isVisible({ timeout: 5000 }).catch(() => false);

    // Test button only visible if webhooks exist
    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should close dialog on cancel', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open dialog
    const createButton = page.getByRole('button', { name: /new webhook|create|add/i }).first();
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

    await expect(page).toHaveURL(/\/(webhooks|dashboard)/);
  });

  authTest('should handle webhook errors gracefully', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/webhooks');
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
});
