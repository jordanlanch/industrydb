import { Page } from '@playwright/test'

export interface TerritoryData {
  name: string
  description?: string
  countries: string[]
  regions?: string[]
  cities?: string[]
  industries: string[]
}

export interface TerritoryMemberData {
  email: string
  role: 'manager' | 'member'
}

export class TerritoriesPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/en/dashboard/crm/territories')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewTerritory() {
    await this.page.getByRole('button', { name: /new territory/i }).click()
  }

  async fillTerritoryForm(data: TerritoryData) {
    // Fill name
    await this.page.getByLabel(/territory name/i).fill(data.name)

    // Fill description if provided
    if (data.description) {
      await this.page.getByLabel(/description/i).fill(data.description)
    }

    // Select countries
    for (const country of data.countries) {
      await this.page.getByLabel(/countries/i).click()
      await this.page.getByRole('option', { name: country }).click()
    }

    // Select regions if provided
    if (data.regions && data.regions.length > 0) {
      for (const region of data.regions) {
        await this.page.getByLabel(/regions/i).click()
        await this.page.getByRole('option', { name: region }).click()
      }
    }

    // Fill cities if provided
    if (data.cities && data.cities.length > 0) {
      await this.page.getByLabel(/cities/i).fill(data.cities.join(', '))
    }

    // Select industries
    for (const industry of data.industries) {
      await this.page.getByLabel(/industries/i).click()
      await this.page.getByRole('option', { name: new RegExp(industry, 'i') }).click()
    }
  }

  async submitTerritoryForm() {
    await this.page.getByRole('button', { name: /create territory/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async createTerritory(data: TerritoryData) {
    await this.clickNewTerritory()
    await this.fillTerritoryForm(data)
    await this.submitTerritoryForm()
  }

  async getTerritoryByName(name: string) {
    return this.page.getByRole('row', { name: new RegExp(name) })
  }

  async clickTerritoryActions(territoryName: string) {
    const row = await this.getTerritoryByName(territoryName)
    await row.getByRole('button', { name: /actions/i }).click()
  }

  async viewTerritoryDetails(territoryName: string) {
    await this.clickTerritoryActions(territoryName)
    await this.page.getByRole('menuitem', { name: /view details/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async editTerritory(territoryName: string) {
    await this.clickTerritoryActions(territoryName)
    await this.page.getByRole('menuitem', { name: /edit/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async deleteTerritory(territoryName: string) {
    await this.clickTerritoryActions(territoryName)
    await this.page.getByRole('menuitem', { name: /delete/i }).click()

    // Confirm deletion
    await this.page.getByRole('button', { name: /confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async addMember(territoryName: string, member: TerritoryMemberData) {
    await this.viewTerritoryDetails(territoryName)

    // Click add member button
    await this.page.getByRole('button', { name: /add member/i }).click()

    // Fill member form
    await this.page.getByLabel(/email/i).fill(member.email)
    await this.page.getByLabel(/role/i).selectOption(member.role)

    // Submit
    await this.page.getByRole('button', { name: /add/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async removeMember(territoryName: string, memberEmail: string) {
    await this.viewTerritoryDetails(territoryName)

    // Find member row and click remove
    const memberRow = this.page.getByRole('row', { name: new RegExp(memberEmail) })
    await memberRow.getByRole('button', { name: /remove/i }).click()

    // Confirm removal
    await this.page.getByRole('button', { name: /confirm/i }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async filterByActive(active: boolean) {
    await this.page.getByLabel(/filter by status/i).selectOption(active ? 'active' : 'inactive')
    await this.page.waitForLoadState('networkidle')
  }

  async searchTerritories(query: string) {
    await this.page.getByPlaceholder(/search territories/i).fill(query)
    await this.page.waitForLoadState('networkidle')
  }

  async getTerritoryCount() {
    const countText = await this.page.getByText(/\d+ territories?/i).textContent()
    if (!countText) return 0
    const match = countText.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  async getTerritoryMembers() {
    const memberRows = await this.page.getByRole('row').filter({ has: this.page.getByRole('cell') }).all()
    return memberRows.length - 1 // Exclude header row
  }
}
