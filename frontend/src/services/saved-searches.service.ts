import axios from 'axios'
import type { FilterState } from '@/components/leads/advanced-filter-panel'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7890'

export interface SavedSearch {
  id: number
  user_id: number
  name: string
  filters: FilterState
  created_at: string
  updated_at: string
}

export interface CreateSavedSearchRequest {
  name: string
  filters: FilterState
}

export interface UpdateSavedSearchRequest {
  name?: string
  filters?: FilterState
}

export interface SavedSearchesResponse {
  searches: SavedSearch[]
  count: number
}

class SavedSearchesService {
  /**
   * Create a new saved search
   */
  async create(data: CreateSavedSearchRequest): Promise<SavedSearch> {
    const response = await axios.post<SavedSearch>(
      `${API_URL}/api/v1/saved-searches`,
      data
    )
    return response.data
  }

  /**
   * Get all saved searches for the current user
   */
  async getAll(): Promise<SavedSearchesResponse> {
    const response = await axios.get<SavedSearchesResponse>(
      `${API_URL}/api/v1/saved-searches`
    )
    return response.data
  }

  /**
   * Get a specific saved search by ID
   */
  async getById(id: number): Promise<SavedSearch> {
    const response = await axios.get<SavedSearch>(
      `${API_URL}/api/v1/saved-searches/${id}`
    )
    return response.data
  }

  /**
   * Update a saved search
   */
  async update(id: number, data: UpdateSavedSearchRequest): Promise<SavedSearch> {
    const response = await axios.patch<SavedSearch>(
      `${API_URL}/api/v1/saved-searches/${id}`,
      data
    )
    return response.data
  }

  /**
   * Delete a saved search
   */
  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/api/v1/saved-searches/${id}`)
  }
}

export const savedSearchesService = new SavedSearchesService()
