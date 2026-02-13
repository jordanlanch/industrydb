import { apiClient } from '@/lib/api-client'
import { leadsCache, generateCacheKey } from '@/lib/cache'
import type { Lead, LeadListResponse, LeadSearchRequest, UsageInfo, LeadPreviewResponse } from '@/types'

export const leadsService = {
  async search(params: LeadSearchRequest): Promise<LeadListResponse> {
    // Generate cache key from search params
    const cacheKey = generateCacheKey('leads:search', params)

    // Check cache first
    const cached = leadsCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Cache miss - fetch from API
    const response = await apiClient.get<LeadListResponse>('/leads', { params })

    // Store in cache
    leadsCache.set(cacheKey, response.data)

    return response.data
  },

  async getById(id: number): Promise<Lead> {
    const cacheKey = `leads:${id}`

    // Check cache first
    const cached = leadsCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const response = await apiClient.get<Lead>(`/leads/${id}`)
    leadsCache.set(cacheKey, response.data)
    return response.data
  },

  async getUsage(): Promise<UsageInfo> {
    // Don't cache usage info - it needs to be fresh
    const response = await apiClient.get<UsageInfo>('/user/usage')
    return response.data
  },

  /**
   * Preview search results without charging credits
   * Returns estimated count and statistics for informed decision-making
   */
  async preview(params: LeadSearchRequest): Promise<LeadPreviewResponse> {
    // Generate cache key from search params (exclude pagination)
    const { page, limit, ...previewParams } = params
    const cacheKey = generateCacheKey('leads:preview', previewParams)

    // Check cache first (preview is heavily cached - 15 minutes)
    const cached = leadsCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Cache miss - fetch from API
    const response = await apiClient.get<LeadPreviewResponse>('/leads/preview', {
      params: previewParams
    })

    // Store in cache (longer TTL for preview - 15 minutes)
    leadsCache.set(cacheKey, response.data, 15 * 60 * 1000)

    return response.data
  },

  /**
   * Clear leads cache (useful after export or when filters change significantly)
   */
  clearCache(): void {
    leadsCache.clear()
  }
}
