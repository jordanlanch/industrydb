import { billingService } from '../billing.service'
import { apiClient } from '@/lib/api-client'
import type { CheckoutResponse, CustomerPortalResponse, PricingResponse } from '@/types'

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

const mockPricing: PricingResponse = {
  tiers: [
    {
      name: 'Free',
      price: 0,
      leads_limit: 50,
      description: 'Basic access',
      features: ['50 leads/month'],
    },
    {
      name: 'Starter',
      price: 49,
      leads_limit: 500,
      description: 'For small businesses',
      features: ['500 leads/month', 'Phone data'],
    },
  ],
}

const mockCheckoutResponse: CheckoutResponse = {
  session_id: 'cs_test_123',
  url: 'https://checkout.stripe.com/session/cs_test_123',
  expires_at: 1706956800,
}

const mockPortalResponse: CustomerPortalResponse = {
  url: 'https://billing.stripe.com/session/bps_test_456',
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('billingService', () => {
  describe('getPricing', () => {
    it('calls GET /pricing and returns tiers', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockPricing })

      const result = await billingService.getPricing()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/pricing')
      expect(result).toEqual(mockPricing)
      expect(result.tiers).toHaveLength(2)
    })
  })

  describe('createCheckout', () => {
    it('sends correct tier to /billing/checkout', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockCheckoutResponse })

      const result = await billingService.createCheckout({ tier: 'pro' })

      expect(mockedApiClient.post).toHaveBeenCalledWith('/billing/checkout', { tier: 'pro' })
      expect(result.session_id).toBe('cs_test_123')
      expect(result.url).toContain('stripe.com')
    })

    it('supports all tier types', async () => {
      for (const tier of ['starter', 'pro', 'business'] as const) {
        mockedApiClient.post.mockResolvedValueOnce({ data: mockCheckoutResponse })

        await billingService.createCheckout({ tier })

        expect(mockedApiClient.post).toHaveBeenCalledWith('/billing/checkout', { tier })
      }
    })

    it('propagates API errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Payment required'))

      await expect(billingService.createCheckout({ tier: 'pro' })).rejects.toThrow(
        'Payment required'
      )
    })
  })

  describe('createPortalSession', () => {
    it('sends POST to /billing/portal without return URL', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockPortalResponse })

      const result = await billingService.createPortalSession()

      expect(mockedApiClient.post).toHaveBeenCalledWith('/billing/portal', null, {
        params: undefined,
      })
      expect(result.url).toContain('stripe.com')
    })

    it('includes return_url as query param when provided', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockPortalResponse })

      await billingService.createPortalSession('https://industrydb.io/dashboard/settings')

      expect(mockedApiClient.post).toHaveBeenCalledWith('/billing/portal', null, {
        params: { return_url: 'https://industrydb.io/dashboard/settings' },
      })
    })

    it('propagates API errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('No subscription'))

      await expect(billingService.createPortalSession()).rejects.toThrow('No subscription')
    })
  })
})
