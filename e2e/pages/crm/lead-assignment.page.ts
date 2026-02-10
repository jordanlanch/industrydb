import { Page } from '@playwright/test'

export class LeadAssignmentPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/en/dashboard/leads')
    await this.page.waitForLoadState('networkidle')
  }

  async selectLead(leadId: string) {
    const leadRow = this.page.getByRole('row', { name: new RegExp(leadId) })
    await leadRow.getByRole('checkbox').check()
  }

  async selectMultipleLeads(leadIds: string[]) {
    for (const leadId of leadIds) {
      await this.selectLead(leadId)
    }
  }

  async clickAssignButton() {
    await this.page.getByRole('button', { name: /assign/i }).click()
  }

  async assignToUser(userEmail: string, reason?: string) {
    await this.page.getByLabel(/assign to/i).fill(userEmail)

    if (reason) {
      await this.page.getByLabel(/reason/i).fill(reason)
    }

    await this.page.getByRole('button', { name: /assign selected/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async autoAssign() {
    await this.page.getByRole('button', { name: /auto.assign/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async batchAssign(leadIds: string[], strategy: 'round_robin' | 'territory' | 'random') {
    await this.selectMultipleLeads(leadIds)
    await this.clickAssignButton()

    await this.page.getByLabel(/assignment strategy/i).selectOption(strategy)
    await this.page.getByRole('button', { name: /assign/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async viewAssignmentHistory(leadId: string) {
    const leadRow = this.page.getByRole('row', { name: new RegExp(leadId) })
    await leadRow.click()
    await this.page.getByRole('tab', { name: /assignment history/i }).click()
  }

  async getAssignedUser(leadId: string) {
    const leadRow = this.page.getByRole('row', { name: new RegExp(leadId) })
    const assignedCell = leadRow.locator('[data-testid="assigned-to"]')
    return await assignedCell.textContent()
  }

  async reassignLead(leadId: string, newUserEmail: string) {
    const leadRow = this.page.getByRole('row', { name: new RegExp(leadId) })
    await leadRow.getByRole('button', { name: /reassign/i }).click()

    await this.page.getByLabel(/reassign to/i).fill(newUserEmail)
    await this.page.getByRole('button', { name: /save/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async filterByAssignedUser(userEmail: string) {
    await this.page.getByLabel(/filter by assignee/i).fill(userEmail)
    await this.page.waitForLoadState('networkidle')
  }

  async filterByUnassigned() {
    await this.page.getByLabel(/show unassigned only/i).check()
    await this.page.waitForLoadState('networkidle')
  }
}
