import { leadsService } from '../leads.service'
import { apiClient } from '@/lib/api-client'
import { leadsCache, generateCacheKey } from '@/lib/cache'
import type { LeadListResponse, Lead, LeadPreviewResponse } from '@/types'

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}))

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

const mockLead: Lead = {
  id: 1,
  name: 'Test Studio',
  industry: 'tattoo',
  country: 'US',
  city: 'New York',
  verified: true,
  quality_score: 75,
  created_at: '2026-01-01T00:00:00Z',
}

const mockLeadListResponse: LeadListResponse = {
  data: [mockLead],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
  filters: { industry: 'tattoo' },
}

const mockPreviewResponse: LeadPreviewResponse = {
  estimated_count: 100,
  with_email_count: 50,
  with_email_pct: 50,
  with_phone_count: 70,
  with_phone_pct: 70,
  verified_count: 80,
  verified_pct: 80,
  quality_score_avg: 65,
}

beforeEach(() => {
  jest.clearAllMocks()
  leadsCache.clear()
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('leadsService', () => {
  describe('search', () => {
    it('sends correct query params to /leads', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockLeadListResponse })

      const params = { industry: 'tattoo', country: 'US', page: 1, limit: 10 }
      const result = await leadsService.search(params)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/leads', { params })
      expect(result).toEqual(mockLeadListResponse)
    })

    it('returns cached result on second call (cache hit)', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockLeadListResponse })

      const params = { industry: 'tattoo', country: 'US' }

      // First call - cache miss
      await leadsService.search(params)
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      const result = await leadsService.search(params)
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1) // Not called again
      expect(result).toEqual(mockLeadListResponse)
    })

    it('fetches from API when cache is expired', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockLeadListResponse })

      const params = { industry: 'tattoo' }

      // Pre-populate cache with expired entry
      const cacheKey = generateCacheKey('leads:search', params)
      leadsCache.set(cacheKey, mockLeadListResponse, -1) // Already expired

      const result = await leadsService.search(params)

      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockLeadListResponse)
    })

    it('propagates API errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(leadsService.search({ industry: 'tattoo' })).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('calls correct endpoint /leads/:id', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockLead })

      const result = await leadsService.getById(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/leads/1')
      expect(result).toEqual(mockLead)
    })

    it('caches result by lead id', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockLead })

      await leadsService.getById(1)
      const result = await leadsService.getById(1)

      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockLead)
    })

    it('propagates API errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Not found'))

      await expect(leadsService.getById(999)).rejects.toThrow('Not found')
    })
  })

  describe('getUsage', () => {
    it('calls /user/usage without caching', async () => {
      const mockUsage = { usage_count: 10, usage_limit: 50, remaining: 40, reset_at: '2026-02-01', tier: 'free' }
      mockedApiClient.get.mockResolvedValue({ data: mockUsage })

      await leadsService.getUsage()
      await leadsService.getUsage()

      // Should always call API (no cache)
      expect(mockedApiClient.get).toHaveBeenCalledTimes(2)
      expect(mockedApiClient.get).toHaveBeenCalledWith('/user/usage')
    })
  })

  describe('preview', () => {
    it('sends correct params to /leads/preview excluding pagination', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPreviewResponse })

      const params = { industry: 'tattoo', country: 'US', page: 2, limit: 50 }
      const result = await leadsService.preview(params)

      // page and limit should be excluded from preview params
      expect(mockedApiClient.get).toHaveBeenCalledWith('/leads/preview', {
        params: { industry: 'tattoo', country: 'US' },
      })
      expect(result).toEqual(mockPreviewResponse)
    })

    it('caches preview results', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPreviewResponse })

      const params = { industry: 'tattoo', country: 'US', page: 1, limit: 10 }
      await leadsService.preview(params)
      const result = await leadsService.preview(params)

      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockPreviewResponse)
    })

    it('propagates API errors', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Server error'))

      await expect(leadsService.preview({ industry: 'tattoo' })).rejects.toThrow('Server error')
    })
  })

  describe('clearCache', () => {
    it('clears the leads cache', async () => {
      mockedApiClient.get.mockResolvedValue({ data: mockLeadListResponse })

      // Populate cache
      await leadsService.search({ industry: 'tattoo' })
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1)

      // Clear cache
      leadsService.clearCache()

      // Should fetch again after cache clear
      await leadsService.search({ industry: 'tattoo' })
      expect(mockedApiClient.get).toHaveBeenCalledTimes(2)
    })
  })
})
