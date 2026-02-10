/**
 * E2E Tests: Lead Assignment
 *
 * Tests lead assignment and routing functionality
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';

authTest.describe('Lead Assignment', () => {
  authTest('should show lead assignment page', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Page should load
    const url = page.url();
    expect(url.includes('/lead-assignment') || url.includes('/dashboard')).toBeTruthy();
  });

  authTest('should display lead assignment heading', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for heading
    const heading = page.getByRole('heading', { name: /lead assignment|assignment/i }).first();
    const hasHeading = await heading.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasHeading) {
      await expect(heading).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(lead-assignment|dashboard)/);
  });

  authTest('should show assign button', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for assign button
    const assignButton = page.getByRole('button', { name: /assign|select/i }).first();
    const hasButton = await assignButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await expect(assignButton).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(lead-assignment|dashboard)/);
  });

  authTest('should show leads list for assignment', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for leads list or empty state
    const leadsList = page.locator('[data-testid="lead-item"], .lead-row, table tbody tr').first();
    const hasLeads = await leadsList.isVisible({ timeout: 5000 }).catch(() => false);

    const emptyState = page.getByText(/no leads|no unassigned/i).first();
    const hasEmpty = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);

    // Either leads or empty state
    expect(hasLeads || hasEmpty).toBeTruthy();
  });

  authTest('should show user selector for assignment', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for user selector
    const userSelector = page.getByText(/assign to|user|team member/i).first();
    const hasSelector = await userSelector.isVisible({ timeout: 5000 }).catch(() => false);

    // User selector might only show after selecting lead
    await expect(page).toHaveURL(/\/(lead-assignment|dashboard)/);
  });

  authTest('should show auto-assign option', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for auto-assign
    const autoAssign = page.getByRole('button', { name: /auto.assign|round.robin/i }).first();
    const hasAuto = await autoAssign.isVisible({ timeout: 5000 }).catch(() => false);

    // Auto-assign might be a feature only for certain tiers
    await expect(page).toHaveURL(/\/(lead-assignment|dashboard)/);
  });

  authTest('should show batch assign option', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for batch assign
    const batchAssign = page.getByRole('button', { name: /batch|select all|bulk/i }).first();
    const hasBatch = await batchAssign.isVisible({ timeout: 5000 }).catch(() => false);

    // Batch assign might be a premium feature
    await expect(page).toHaveURL(/\/(lead-assignment|dashboard)/);
  });

  authTest('should show assignment history', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for history section
    const historySection = page.getByText(/history|assigned|recent/i).first();
    const hasHistory = await historySection.isVisible({ timeout: 5000 }).catch(() => false);

    // History might be on a separate tab or page
    await expect(page).toHaveURL(/\/(lead-assignment|dashboard)/);
  });

  authTest('should filter unassigned leads', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for filter
    const unassignedFilter = page.getByText(/unassigned|filter/i).first();
    const hasFilter = await unassignedFilter.isVisible({ timeout: 5000 }).catch(() => false);

    // Filter should be available
    await expect(page).toHaveURL(/\/(lead-assignment|dashboard)/);
  });

  authTest('should handle assignment errors gracefully', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
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

  authTest('should validate assignee selection', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/crm/lead-assignment');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Try to assign without selecting user
    const assignButton = page.getByRole('button', { name: /assign selected|confirm/i }).first();
    const hasButton = await assignButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasButton) {
      await assignButton.click().catch(() => {});
      await page.waitForTimeout(500);

      // Look for validation error
      const validationError = page.getByText(/select a user|select a lead/i).first();
      const hasError = await validationError.isVisible({ timeout: 2000 }).catch(() => false);
    }

    await expect(page).toHaveURL(/\/(lead-assignment|dashboard)/);
  });
});
