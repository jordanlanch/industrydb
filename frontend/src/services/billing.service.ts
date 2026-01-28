import { apiClient } from '@/lib/api-client'
import type { CheckoutRequest, CheckoutResponse, CustomerPortalResponse, PricingResponse } from '@/types'

export const billingService = {
  async getPricing(): Promise<PricingResponse> {
    const response = await apiClient.get<PricingResponse>('/pricing')
    return response.data
  },

  async createCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post<CheckoutResponse>('/billing/checkout', data)
    return response.data
  },

  async createPortalSession(returnUrl?: string): Promise<CustomerPortalResponse> {
    const response = await apiClient.post<CustomerPortalResponse>(
      '/billing/portal',
      null,
      {
        params: returnUrl ? { return_url: returnUrl } : undefined,
      }
    )
    return response.data
  },
}
