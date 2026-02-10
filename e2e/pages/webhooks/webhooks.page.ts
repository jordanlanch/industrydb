import { Page } from '@playwright/test'

export interface WebhookData {
  url: string
  events: string[]
  description?: string
}

export class WebhooksPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/en/dashboard/settings/webhooks')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewWebhook() {
    await this.page.getByRole('button', { name: /new webhook/i }).click()
  }

  async fillWebhookForm(data: WebhookData) {
    await this.page.getByLabel(/webhook url/i).fill(data.url)

    if (data.description) {
      await this.page.getByLabel(/description/i).fill(data.description)
    }

    // Select events
    for (const event of data.events) {
      await this.page.getByRole('checkbox', { name: new RegExp(event, 'i') }).check()
    }
  }

  async submitWebhookForm() {
    await this.page.getByRole('button', { name: /create webhook/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async createWebhook(data: WebhookData) {
    await this.clickNewWebhook()
    await this.fillWebhookForm(data)
    await this.submitWebhookForm()
  }

  async getWebhookSecret(webhookUrl: string) {
    const row = this.page.getByRole('row', { name: new RegExp(webhookUrl) })
    await row.click()

    const secret = this.page.locator('[data-testid="webhook-secret"]')
    return await secret.textContent()
  }

  async toggleWebhook(webhookUrl: string, active: boolean) {
    const row = this.page.getByRole('row', { name: new RegExp(webhookUrl) })
    const toggle = row.getByRole('switch')

    if (active) {
      await toggle.check()
    } else {
      await toggle.uncheck()
    }

    await this.page.waitForLoadState('networkidle')
  }

  async deleteWebhook(webhookUrl: string) {
    const row = this.page.getByRole('row', { name: new RegExp(webhookUrl) })
    await row.getByRole('button', { name: /delete/i }).click()

    await this.page.getByRole('button', { name: /confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async updateWebhook(webhookUrl: string, newData: Partial<WebhookData>) {
    const row = this.page.getByRole('row', { name: new RegExp(webhookUrl) })
    await row.getByRole('button', { name: /edit/i }).click()

    if (newData.url) {
      await this.page.getByLabel(/webhook url/i).fill(newData.url)
    }

    if (newData.description !== undefined) {
      await this.page.getByLabel(/description/i).fill(newData.description)
    }

    if (newData.events) {
      // Uncheck all first
      const checkboxes = await this.page.getByRole('checkbox').all()
      for (const checkbox of checkboxes) {
        await checkbox.uncheck()
      }

      // Check new events
      for (const event of newData.events) {
        await this.page.getByRole('checkbox', { name: new RegExp(event, 'i') }).check()
      }
    }

    await this.page.getByRole('button', { name: /save/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async viewDeliveries(webhookUrl: string) {
    const row = this.page.getByRole('row', { name: new RegExp(webhookUrl) })
    await row.click()
    await this.page.getByRole('tab', { name: /deliveries/i }).click()
  }

  async getDeliveryCount() {
    const deliveries = await this.page.locator('[data-testid="delivery-entry"]').all()
    return deliveries.length
  }

  async getSuccessCount() {
    const successCount = this.page.locator('[data-testid="success-count"]')
    const text = await successCount.textContent()
    return text ? parseInt(text.replace(/,/g, '')) : 0
  }

  async getFailureCount() {
    const failureCount = this.page.locator('[data-testid="failure-count"]')
    const text = await failureCount.textContent()
    return text ? parseInt(text.replace(/,/g, '')) : 0
  }

  async testWebhook(webhookUrl: string) {
    const row = this.page.getByRole('row', { name: new RegExp(webhookUrl) })
    await row.getByRole('button', { name: /test/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async createBatchWebhooks(webhooks: WebhookData[]) {
    for (const webhook of webhooks) {
      await this.createWebhook(webhook)
    }
  }

  async deleteBatchWebhooks(webhookUrls: string[]) {
    // Select all webhooks
    for (const url of webhookUrls) {
      const row = this.page.getByRole('row', { name: new RegExp(url) })
      await row.getByRole('checkbox').check()
    }

    // Click batch delete
    await this.page.getByRole('button', { name: /delete selected/i }).click()
    await this.page.getByRole('button', { name: /confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }
}
