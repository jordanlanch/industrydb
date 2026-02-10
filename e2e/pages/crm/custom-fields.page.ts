import { Page } from '@playwright/test'

export interface CustomFieldDefinition {
  name: string
  label: string
  fieldType: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean' | 'url'
  options?: string[]
  required?: boolean
  industry?: string
}

export class CustomFieldsPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/en/dashboard/settings/custom-fields')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewField() {
    await this.page.getByRole('button', { name: /new custom field/i }).click()
  }

  async fillFieldDefinition(field: CustomFieldDefinition) {
    await this.page.getByLabel(/field name/i).fill(field.name)
    await this.page.getByLabel(/field label/i).fill(field.label)
    await this.page.getByLabel(/field type/i).selectOption(field.fieldType)

    if (field.options && (field.fieldType === 'select' || field.fieldType === 'multiselect')) {
      for (const option of field.options) {
        await this.page.getByRole('button', { name: /add option/i }).click()
        await this.page.getByPlaceholder(/option value/i).last().fill(option)
      }
    }

    if (field.required !== undefined) {
      if (field.required) {
        await this.page.getByLabel(/required field/i).check()
      }
    }

    if (field.industry) {
      await this.page.getByLabel(/industry/i).selectOption(field.industry)
    }
  }

  async submitFieldDefinition() {
    await this.page.getByRole('button', { name: /create field/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async createCustomField(field: CustomFieldDefinition) {
    await this.clickNewField()
    await this.fillFieldDefinition(field)
    await this.submitFieldDefinition()
  }

  async deleteField(fieldName: string) {
    const row = this.page.getByRole('row', { name: new RegExp(fieldName) })
    await row.getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToLead(leadId: string) {
    await this.page.goto(`/en/dashboard/leads/${leadId}`)
    await this.page.waitForLoadState('networkidle')
  }

  async setCustomFieldValue(fieldName: string, value: string | boolean) {
    await this.page.getByRole('tab', { name: /custom fields/i }).click()

    if (typeof value === 'boolean') {
      if (value) {
        await this.page.getByLabel(new RegExp(fieldName, 'i')).check()
      } else {
        await this.page.getByLabel(new RegExp(fieldName, 'i')).uncheck()
      }
    } else {
      await this.page.getByLabel(new RegExp(fieldName, 'i')).fill(value)
    }

    await this.page.getByRole('button', { name: /save/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async getCustomFieldValue(fieldName: string) {
    await this.page.getByRole('tab', { name: /custom fields/i }).click()
    const field = this.page.getByLabel(new RegExp(fieldName, 'i'))
    return await field.inputValue()
  }
}
