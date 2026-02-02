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

  async download(id: number): Promise<void> {
    // Use axios to download with Authorization header (no token in URL)
    const response = await apiClient.get(`/exports/${id}/download`, {
      responseType: 'blob',
    })

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition']
    let filename = `export-${id}.csv`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    // Create blob URL and trigger download
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
