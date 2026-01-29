import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7890'

interface CountriesResponse {
  countries: string[]
  total: number
}

interface CitiesResponse {
  cities: string[]
  total: number
  country?: string
}

class FiltersService {
  /**
   * Get list of available countries
   */
  async getCountries(): Promise<string[]> {
    const response = await axios.get<CountriesResponse>(
      `${API_URL}/api/v1/leads/filters/countries`
    )
    return response.data.countries
  }

  /**
   * Get list of available cities (optionally filtered by country)
   */
  async getCities(country?: string): Promise<string[]> {
    const params = country ? { country } : {}
    const response = await axios.get<CitiesResponse>(
      `${API_URL}/api/v1/leads/filters/cities`,
      { params }
    )
    return response.data.cities
  }
}

export const filtersService = new FiltersService()
