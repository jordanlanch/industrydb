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

interface PopularCountriesResponse {
  countries: string[]
}

// Fallback popular countries (top 12 by lead count from data coverage)
const FALLBACK_POPULAR_COUNTRIES = [
  'NL', // Netherlands - 6,033 leads
  'AT', // Austria - 3,091 leads
  'DE', // Germany - 2,970 leads
  'TW', // Taiwan - 2,786 leads
  'TR', // Turkey - 2,574 leads
  'HU', // Hungary - 2,291 leads
  'CL', // Chile - 2,281 leads
  'IE', // Ireland - 2,259 leads
  'CH', // Switzerland - 2,254 leads
  'AR', // Argentina - 2,030 leads
  'US', // United States
  'GB', // United Kingdom
]

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

  /**
   * Get list of popular countries (data-driven or fallback)
   */
  async getPopularCountries(): Promise<string[]> {
    try {
      const response = await axios.get<PopularCountriesResponse>(
        `${API_URL}/api/v1/leads/filters/popular-countries`
      )
      return response.data.countries
    } catch (error) {
      // Fallback to hardcoded list if endpoint doesn't exist yet
      console.log('Using fallback popular countries (backend endpoint not available)')
      return FALLBACK_POPULAR_COUNTRIES
    }
  }
}

export const filtersService = new FiltersService()
