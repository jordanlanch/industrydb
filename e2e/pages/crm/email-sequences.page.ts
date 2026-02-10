import { Page } from '@playwright/test'

export interface EmailSequenceData {
  name: string
  description?: string
  trigger: 'manual' | 'lead_created' | 'tag_added'
}

export interface SequenceStepData {
  stepOrder: number
  delayDays: number
  subject: string
  body: string
}

export class EmailSequencesPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/en/dashboard/crm/email-sequences')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewSequence() {
    await this.page.getByRole('button', { name: /new sequence/i }).click()
  }

  async fillSequenceForm(data: EmailSequenceData) {
    await this.page.getByLabel(/sequence name/i).fill(data.name)

    if (data.description) {
      await this.page.getByLabel(/description/i).fill(data.description)
    }

    await this.page.getByLabel(/trigger/i).selectOption(data.trigger)
  }

  async submitSequenceForm() {
    await this.page.getByRole('button', { name: /create sequence/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async createSequence(data: EmailSequenceData) {
    await this.clickNewSequence()
    await this.fillSequenceForm(data)
    await this.submitSequenceForm()
  }

  async getSequenceByName(name: string) {
    return this.page.getByRole('row', { name: new RegExp(name) })
  }

  async viewSequenceDetails(sequenceName: string) {
    const row = await this.getSequenceByName(sequenceName)
    await row.click()
    await this.page.waitForLoadState('networkidle')
  }

  async addStep(stepData: SequenceStepData) {
    await this.page.getByRole('button', { name: /add step/i }).click()

    await this.page.getByLabel(/step order/i).fill(stepData.stepOrder.toString())
    await this.page.getByLabel(/delay \(days\)/i).fill(stepData.delayDays.toString())
    await this.page.getByLabel(/subject/i).fill(stepData.subject)
    await this.page.getByLabel(/email body/i).fill(stepData.body)

    await this.page.getByRole('button', { name: /save step/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async enrollLead(sequenceName: string, leadId: string) {
    await this.viewSequenceDetails(sequenceName)
    await this.page.getByRole('button', { name: /enroll lead/i }).click()

    await this.page.getByLabel(/lead id/i).fill(leadId)
    await this.page.getByRole('button', { name: /enroll/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async stopEnrollment(sequenceName: string, leadId: string) {
    await this.viewSequenceDetails(sequenceName)

    const enrollmentRow = this.page.getByRole('row', { name: new RegExp(leadId) })
    await enrollmentRow.getByRole('button', { name: /stop/i }).click()

    await this.page.getByRole('button', { name: /confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async activateSequence(sequenceName: string) {
    await this.viewSequenceDetails(sequenceName)
    await this.page.getByRole('button', { name: /activate/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async pauseSequence(sequenceName: string) {
    await this.viewSequenceDetails(sequenceName)
    await this.page.getByRole('button', { name: /pause/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async deleteSequence(sequenceName: string) {
    const row = await this.getSequenceByName(sequenceName)
    await row.getByRole('button', { name: /actions/i }).click()
    await this.page.getByRole('menuitem', { name: /delete/i }).click()

    await this.page.getByRole('button', { name: /confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async getStepCount() {
    const steps = await this.page.getByRole('listitem').filter({ hasText: /step \d+/i }).all()
    return steps.length
  }

  async getEnrollmentCount() {
    const enrollments = await this.page.getByRole('row').filter({ has: this.page.getByText(/enrolled/i) }).all()
    return Math.max(0, enrollments.length - 1) // Exclude header
  }

  async filterByStatus(status: 'draft' | 'active' | 'paused' | 'archived') {
    await this.page.getByLabel(/filter by status/i).selectOption(status)
    await this.page.waitForLoadState('networkidle')
  }

  async searchSequences(query: string) {
    await this.page.getByPlaceholder(/search sequences/i).fill(query)
    await this.page.waitForLoadState('networkidle')
  }
}
