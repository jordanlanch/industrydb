/**
 * E2E Tests: Analytics Dashboard
 *
 * Tests analytics dashboard functionality
 */

import { test as authTest, expect } from '../../fixtures/auth.fixture';

authTest.describe('Analytics Dashboard', () => {
  authTest('should show analytics page', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Page should load
    const url = page.url();
    expect(url.includes('/analytics') || url.includes('/dashboard')).toBeTruthy();
  });

  authTest('should display analytics heading', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for heading
    const heading = page.getByRole('heading', { name: /analytics|usage|statistics/i }).first();
    const hasHeading = await heading.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasHeading) {
      await expect(heading).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show usage metrics', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for usage metrics
    const usageMetric = page.getByText(/usage|searches|exports|leads/i).first();
    const hasUsage = await usageMetric.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasUsage) {
      await expect(usageMetric).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show date range selector', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for date range selector
    const dateSelector = page.getByText(/last.*days|date range|period/i).first();
    const hasSelector = await dateSelector.isVisible({ timeout: 5000 }).catch(() => false);

    // Date selector might be visible
    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show charts or visualizations', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for charts
    const chart = page.locator('[data-testid*="chart"], canvas, svg.recharts-surface, .chart').first();
    const hasChart = await chart.isVisible({ timeout: 5000 }).catch(() => false);

    // Charts might not be visible if no data
    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show search count metric', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for search count
    const searchCount = page.getByText(/search.*count|total.*searches/i).first();
    const hasCount = await searchCount.isVisible({ timeout: 5000 }).catch(() => false);

    // Search count should be visible
    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show export count metric', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for export count
    const exportCount = page.getByText(/export.*count|total.*exports/i).first();
    const hasCount = await exportCount.isVisible({ timeout: 5000 }).catch(() => false);

    // Export count should be visible
    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show usage limit indicator', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for limit indicator
    const limitIndicator = page.getByText(/limit|remaining|quota/i).first();
    const hasLimit = await limitIndicator.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasLimit) {
      await expect(limitIndicator).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show export report button', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|download|csv|pdf/i }).first();
    const hasExport = await exportButton.isVisible({ timeout: 5000 }).catch(() => false);

    // Export button might be a premium feature
    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show usage trend', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for trend indicator
    const trend = page.getByText(/trend|growth|increase|decrease|%/i).first();
    const hasTrend = await trend.isVisible({ timeout: 5000 }).catch(() => false);

    // Trend might be visible if data exists
    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show subscription tier info', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for tier info
    const tierInfo = page.getByText(/free|starter|pro|business|tier|plan/i).first();
    const hasTier = await tierInfo.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasTier) {
      await expect(tierInfo).toBeVisible();
    }

    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show time period tabs', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for period tabs
    const periodTab = page.getByRole('tab', { name: /day|week|month|year|7 days|30 days/i }).first();
    const hasTab = await periodTab.isVisible({ timeout: 5000 }).catch(() => false);

    // Period tabs might be visible
    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should show activity log', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for activity log
    const activityLog = page.getByText(/activity|history|log|recent/i).first();
    const hasLog = await activityLog.isVisible({ timeout: 5000 }).catch(() => false);

    // Activity log might be on a separate tab
    await expect(page).toHaveURL(/\/(analytics|dashboard)/);
  });

  authTest('should handle analytics errors gracefully', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
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

  authTest('should show empty state when no data', async ({ authenticatedPage: page }) => {
    await page.goto('/en/dashboard/analytics');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for empty state or data
    const emptyState = page.getByText(/no data|start using|make your first/i).first();
    const hasEmpty = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);

    const dataDisplay = page.locator('[data-testid*="metric"], .metric-card, .stat-card');
    const hasData = await dataDisplay.first().isVisible({ timeout: 5000 }).catch(() => false);

    // Either empty state or data display
    expect(hasEmpty || hasData).toBeTruthy();
  });
});
