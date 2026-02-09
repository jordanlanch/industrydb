import { exportsService } from '../exports.service'
import { apiClient } from '@/lib/api-client'
import type { Export, ExportRequest } from '@/types'

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

const mockExport: Export = {
  id: 1,
  status: 'ready',
  format: 'csv',
  lead_count: 100,
  file_url: 'https://example.com/file.csv',
  expires_at: '2026-02-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('exportsService', () => {
  describe('create', () => {
    it('sends format and filters to /exports', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockExport })

      const exportReq: ExportRequest = {
        format: 'csv',
        filters: { industry: 'tattoo', country: 'US' },
        max_leads: 500,
      }
      const result = await exportsService.create(exportReq)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/exports', exportReq)
      expect(result).toEqual(mockExport)
    })

    it('supports excel format', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: { ...mockExport, format: 'excel' } })

      const exportReq: ExportRequest = { format: 'excel' }
      const result = await exportsService.create(exportReq)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/exports', exportReq)
      expect(result.format).toBe('excel')
    })

    it('propagates API errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Export limit reached'))

      await expect(exportsService.create({ format: 'csv' })).rejects.toThrow('Export limit reached')
    })
  })

  describe('list', () => {
    it('returns paginated exports with default params', async () => {
      const listResponse = { data: [mockExport] }
      mockedApiClient.get.mockResolvedValueOnce({ data: listResponse })

      const result = await exportsService.list()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/exports', {
        params: { page: 1, limit: 10 },
      })
      expect(result).toEqual(listResponse)
    })

    it('sends custom pagination params', async () => {
      const listResponse = { data: [mockExport] }
      mockedApiClient.get.mockResolvedValueOnce({ data: listResponse })

      await exportsService.list(2, 25)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/exports', {
        params: { page: 2, limit: 25 },
      })
    })
  })

  describe('getById', () => {
    it('calls correct endpoint /exports/:id', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockExport })

      const result = await exportsService.getById(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/exports/1')
      expect(result).toEqual(mockExport)
    })
  })

  describe('download', () => {
    let mockCreateObjectURL: jest.Mock
    let mockRevokeObjectURL: jest.Mock
    let mockClick: jest.Mock
    let mockAppendChild: jest.SpyInstance
    let mockRemoveChild: jest.SpyInstance

    beforeEach(() => {
      mockCreateObjectURL = jest.fn().mockReturnValue('blob:test-url')
      mockRevokeObjectURL = jest.fn()
      mockClick = jest.fn()

      window.URL.createObjectURL = mockCreateObjectURL
      window.URL.revokeObjectURL = mockRevokeObjectURL

      mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
      mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node)

      jest.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      } as unknown as HTMLAnchorElement)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('downloads file and extracts filename from Content-Disposition', async () => {
      const blobData = new Blob(['csv,data'])
      mockedApiClient.get.mockResolvedValueOnce({
        data: blobData,
        headers: {
          'content-disposition': 'attachment; filename="leads-export.csv"',
        },
      })

      await exportsService.download(1)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/exports/1/download', {
        responseType: 'blob',
      })
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })

    it('uses default filename when Content-Disposition is missing', async () => {
      const blobData = new Blob(['csv,data'])
      mockedApiClient.get.mockResolvedValueOnce({
        data: blobData,
        headers: {},
      })

      await exportsService.download(5)

      const createdLink = (document.createElement as jest.Mock).mock.results[0].value
      expect(createdLink.download).toBe('export-5.csv')
    })

    it('cleans up blob URL after download', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: new Blob(['data']),
        headers: {},
      })

      await exportsService.download(1)

      expect(mockRemoveChild).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })
  })
})
