import { Page } from '@playwright/test'

export class AnalyticsDashboardPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/en/dashboard/analytics')
    await this.page.waitForLoadState('networkidle')
  }

  async selectDateRange(periodStart: string, periodEnd: string) {
    await this.page.getByLabel(/start date/i).fill(periodStart)
    await this.page.getByLabel(/end date/i).fill(periodEnd)
    await this.page.getByRole('button', { name: /apply/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async selectPresetRange(preset: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month') {
    await this.page.getByRole('button', { name: new RegExp(preset.replace(/_/g, ' '), 'i') }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async getMetricValue(metricName: string) {
    const metric = this.page.locator(`[data-testid="metric-${metricName}"]`)
    return await metric.textContent()
  }

  async getMRR() {
    return await this.getMetricValue('mrr')
  }

  async getARR() {
    return await this.getMetricValue('arr')
  }

  async getChurnRate() {
    return await this.getMetricValue('churn-rate')
  }

  async getUserGrowth() {
    return await this.getMetricValue('user-growth')
  }

  async getRevenueGrowth() {
    return await this.getMetricValue('revenue-growth')
  }

  async getARPU() {
    return await this.getMetricValue('arpu')
  }

  async viewRevenueTab() {
    await this.page.getByRole('tab', { name: /revenue/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async viewChurnTab() {
    await this.page.getByRole('tab', { name: /churn/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async viewGrowthTab() {
    await this.page.getByRole('tab', { name: /growth/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async viewSubscriptionTab() {
    await this.page.getByRole('tab', { name: /subscription/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async viewUsageTab() {
    await this.page.getByRole('tab', { name: /usage/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async exportReport(format: 'csv' | 'pdf') {
    await this.page.getByRole('button', { name: /export/i }).click()
    await this.page.getByRole('menuitem', { name: new RegExp(format, 'i') }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async getSubscriptionDistribution() {
    const chart = this.page.locator('[data-testid="subscription-chart"]')
    const tiers = await chart.locator('[data-tier]').all()

    const distribution: Record<string, number> = {}
    for (const tier of tiers) {
      const name = await tier.getAttribute('data-tier')
      const value = await tier.textContent()
      if (name && value) {
        distribution[name] = parseInt(value)
      }
    }

    return distribution
  }

  async getTotalActiveUsers() {
    const users = this.page.locator('[data-testid="total-active-users"]')
    const text = await users.textContent()
    return text ? parseInt(text.replace(/,/g, '')) : 0
  }

  async getPeakUsageHour() {
    return await this.getMetricValue('peak-usage-hour')
  }
}
