import { Page } from '@playwright/test'

export interface SavedSearchData {
  name: string
  description?: string
  industry?: string
  country?: string
  city?: string
  hasEmail?: boolean
  hasPhone?: boolean
  hasWebsite?: boolean
  verified?: boolean
  minQualityScore?: number
  notifyOnNewResults?: boolean
}

export class SavedSearchesPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/en/dashboard/saved-searches')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewSearch() {
    await this.page.getByRole('button', { name: /new saved search/i }).click()
  }

  async fillSearchForm(data: SavedSearchData) {
    await this.page.getByLabel(/search name/i).fill(data.name)

    if (data.description) {
      await this.page.getByLabel(/description/i).fill(data.description)
    }

    if (data.industry) {
      await this.page.getByLabel(/industry/i).selectOption(data.industry)
    }

    if (data.country) {
      await this.page.getByLabel(/country/i).selectOption(data.country)
    }

    if (data.city) {
      await this.page.getByLabel(/city/i).fill(data.city)
    }

    if (data.hasEmail !== undefined) {
      if (data.hasEmail) {
        await this.page.getByLabel(/has email/i).check()
      }
    }

    if (data.hasPhone !== undefined) {
      if (data.hasPhone) {
        await this.page.getByLabel(/has phone/i).check()
      }
    }

    if (data.hasWebsite !== undefined) {
      if (data.hasWebsite) {
        await this.page.getByLabel(/has website/i).check()
      }
    }

    if (data.verified !== undefined) {
      if (data.verified) {
        await this.page.getByLabel(/verified only/i).check()
      }
    }

    if (data.minQualityScore !== undefined) {
      await this.page.getByLabel(/minimum quality score/i).fill(data.minQualityScore.toString())
    }

    if (data.notifyOnNewResults !== undefined) {
      if (data.notifyOnNewResults) {
        await this.page.getByLabel(/notify on new results/i).check()
      }
    }
  }

  async submitSearchForm() {
    await this.page.getByRole('button', { name: /save search/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async createSavedSearch(data: SavedSearchData) {
    await this.clickNewSearch()
    await this.fillSearchForm(data)
    await this.submitSearchForm()
  }

  async executeSearch(searchName: string) {
    const row = this.page.getByRole('row', { name: new RegExp(searchName) })
    await row.getByRole('button', { name: /execute/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async deleteSearch(searchName: string) {
    const row = this.page.getByRole('row', { name: new RegExp(searchName) })
    await row.getByRole('button', { name: /delete/i }).click()
    await this.page.getByRole('button', { name: /confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }
}
