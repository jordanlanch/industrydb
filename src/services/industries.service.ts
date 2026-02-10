import axios from 'axios'
import { industriesCache } from '@/lib/cache'
import type { IndustriesResponse, IndustriesWithLeadsResponse, Industry, SubNicheResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7890'

class IndustriesService {
  /**
   * Get all industries grouped by category (cached for 1 hour)
   */
  async getAllIndustries(): Promise<IndustriesResponse> {
    const cacheKey = 'industries:all'

    // Check cache
    const cached = industriesCache.get(cacheKey)
    if (cached) {
      console.log('✅ Cache hit for industries')
      return cached
    }

    console.log('❌ Cache miss for industries')
    const response = await axios.get<IndustriesResponse>(`${API_URL}/api/v1/industries`)

    // Cache for 1 hour
    industriesCache.set(cacheKey, response.data)

    return response.data
  }

  /**
   * Get a single industry by ID (cached for 1 hour)
   */
  async getIndustry(id: string): Promise<Industry> {
    const cacheKey = `industry:${id}`

    // Check cache
    const cached = industriesCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const response = await axios.get<Industry>(`${API_URL}/api/v1/industries/${id}`)
    industriesCache.set(cacheKey, response.data)
    return response.data
  }

  /**
   * Get flat list of all industries (for simple dropdowns)
   */
  async getIndustriesList(): Promise<Industry[]> {
    const response = await this.getAllIndustries()
    return response?.categories?.flatMap((category) => category.industries ?? []) ?? []
  }

  /**
   * Get only industries that have leads with counts (cached for 5 minutes)
   * Optionally filtered by country and city
   */
  async getIndustriesWithLeads(country?: string, city?: string): Promise<IndustriesWithLeadsResponse> {
    // Build cache key with filters
    let cacheKey = 'industries:with-leads'
    if (country) cacheKey += `:country=${country}`
    if (city) cacheKey += `:city=${city}`

    // Check cache
    const cached = industriesCache.get(cacheKey)
    if (cached) {
      console.log('✅ Cache hit for industries with leads', { country, city })
      return cached
    }

    console.log('❌ Cache miss for industries with leads', { country, city })

    // Build query params
    const params = new URLSearchParams()
    if (country) params.append('country', country)
    if (city) params.append('city', city)

    const url = `${API_URL}/api/v1/industries/with-leads${params.toString() ? '?' + params.toString() : ''}`
    const response = await axios.get<IndustriesWithLeadsResponse>(url)

    // Cache for 5 minutes (lead counts change frequently)
    industriesCache.set(cacheKey, response.data, 5 * 60 * 1000)

    return response.data
  }

  /**
   * Get sub-niches for a specific industry (cached for 1 hour)
   */
  async getSubNiches(industryId: string): Promise<SubNicheResponse> {
    const cacheKey = `sub-niches:${industryId}`

    // Check cache
    const cached = industriesCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const response = await axios.get<SubNicheResponse>(
      `${API_URL}/api/v1/industries/${industryId}/sub-niches`
    )
    industriesCache.set(cacheKey, response.data)
    return response.data
  }
}

export const industriesService = new IndustriesService()
