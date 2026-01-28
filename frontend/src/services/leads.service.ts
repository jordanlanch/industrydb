import { apiClient } from '@/lib/api-client'
import type { Lead, LeadListResponse, LeadSearchRequest, UsageInfo } from '@/types'

export const leadsService = {
  async search(params: LeadSearchRequest): Promise<LeadListResponse> {
    const response = await apiClient.get<LeadListResponse>('/leads', { params })
    return response.data
  },

  async getById(id: number): Promise<Lead> {
    const response = await apiClient.get<Lead>(`/leads/${id}`)
    return response.data
  },

  async getUsage(): Promise<UsageInfo> {
    const response = await apiClient.get<UsageInfo>('/user/usage')
    return response.data
  },
}
