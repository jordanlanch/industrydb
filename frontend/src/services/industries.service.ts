import axios from 'axios'
import type { IndustriesResponse, Industry, SubNicheResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7890'

class IndustriesService {
  /**
   * Get all industries grouped by category
   */
  async getAllIndustries(): Promise<IndustriesResponse> {
    const response = await axios.get<IndustriesResponse>(`${API_URL}/api/v1/industries`)
    return response.data
  }

  /**
   * Get a single industry by ID
   */
  async getIndustry(id: string): Promise<Industry> {
    const response = await axios.get<Industry>(`${API_URL}/api/v1/industries/${id}`)
    return response.data
  }

  /**
   * Get flat list of all industries (for simple dropdowns)
   */
  async getIndustriesList(): Promise<Industry[]> {
    const response = await this.getAllIndustries()
    return response.categories.flatMap((category) => category.industries)
  }

  /**
   * Get sub-niches for a specific industry
   */
  async getSubNiches(industryId: string): Promise<SubNicheResponse> {
    const response = await axios.get<SubNicheResponse>(
      `${API_URL}/api/v1/industries/${industryId}/sub-niches`
    )
    return response.data
  }
}

export const industriesService = new IndustriesService()
