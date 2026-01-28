import { apiClient } from '@/lib/api-client'
import type { Export, ExportRequest } from '@/types'

export const exportsService = {
  async create(data: ExportRequest): Promise<Export> {
    const response = await apiClient.post<Export>('/exports', data)
    return response.data
  },

  async list(page: number = 1, limit: number = 10): Promise<{ data: Export[] }> {
    const response = await apiClient.get<{ data: Export[] }>('/exports', {
      params: { page, limit },
    })
    return response.data
  },

  async getById(id: number): Promise<Export> {
    const response = await apiClient.get<Export>(`/exports/${id}`)
    return response.data
  },

  getDownloadUrl(id: number): string {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    return `${baseURL}/api/v1/exports/${id}/download?token=${token}`
  },
}
