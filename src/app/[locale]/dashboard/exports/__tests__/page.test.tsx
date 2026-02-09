import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExportsPage from '../page'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'My Exports',
      subtitle: 'Download your exported data files',
      refresh: 'Refresh',
      loading: 'Loading exports...',
      noExports: 'No exports yet',
      createFirst: 'Search for leads and export them to see your files here.',
      download: 'Download',
      processingMsg: 'Your export is being processed. This may take a few moments.',
      pendingMsg: 'Your export is queued for processing.',
      'status.ready': 'Ready',
      'status.processing': 'Processing',
      'status.pending': 'Pending',
      'status.failed': 'Failed',
      'details.leads': 'Leads',
      'details.created': 'Created',
      'details.expires': 'Expires',
      'details.status': 'Status',
      'exportNumber': `Export #${key} (CSV)`,
    }
    // Handle parameterized keys
    if (key === 'exportNumber') {
      return (params: any) => `Export #${params?.id} (${params?.format})`
    }
    return translations[key] || key
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Download: (props: any) => <svg data-testid="download-icon" {...props} />,
  FileText: (props: any) => <svg data-testid="file-text-icon" {...props} />,
  Clock: (props: any) => <svg data-testid="clock-icon" {...props} />,
  CheckCircle: (props: any) => <svg data-testid="check-circle-icon" {...props} />,
  XCircle: (props: any) => <svg data-testid="x-circle-icon" {...props} />,
  RefreshCw: (props: any) => <svg data-testid="refresh-icon" {...props} />,
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}))

// Mock exports service
const mockList = jest.fn()
const mockDownload = jest.fn()
jest.mock('@/services/exports.service', () => ({
  exportsService: {
    list: (...args: any[]) => mockList(...args),
    download: (...args: any[]) => mockDownload(...args),
  },
}))

describe('ExportsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading state', () => {
    it('renders loading skeleton while fetching exports', async () => {
      mockList.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 1000))
      )

      render(<ExportsPage />)

      expect(screen.getByText('Loading exports...')).toBeInTheDocument()
    })
  })

  describe('Rendering', () => {
    it('renders page title and subtitle', async () => {
      mockList.mockResolvedValueOnce({ data: [] })

      render(<ExportsPage />)

      expect(screen.getByText('My Exports')).toBeInTheDocument()
      expect(screen.getByText('Download your exported data files')).toBeInTheDocument()
    })

    it('renders refresh button', async () => {
      mockList.mockResolvedValueOnce({ data: [] })

      render(<ExportsPage />)

      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    it('renders exports list when data is available', async () => {
      const mockExports = [
        {
          id: 1,
          status: 'ready' as const,
          format: 'csv' as const,
          lead_count: 100,
          file_url: 'https://example.com/file.csv',
          created_at: '2026-02-01T10:00:00Z',
          expires_at: '2026-02-08T10:00:00Z',
        },
        {
          id: 2,
          status: 'processing' as const,
          format: 'excel' as const,
          lead_count: 50,
          created_at: '2026-02-02T10:00:00Z',
        },
      ]

      mockList.mockResolvedValueOnce({ data: mockExports })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
      })
    })
  })

  describe('Empty state', () => {
    it('shows empty state when no exports exist', async () => {
      mockList.mockResolvedValueOnce({ data: [] })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('No exports yet')).toBeInTheDocument()
        expect(
          screen.getByText('Search for leads and export them to see your files here.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Status badges', () => {
    it('shows Ready badge for ready exports', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 1,
            status: 'ready',
            format: 'csv',
            lead_count: 100,
            file_url: 'https://example.com/file.csv',
            created_at: '2026-02-01T10:00:00Z',
          },
        ],
      })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('Ready')).toBeInTheDocument()
      })
    })

    it('shows Processing badge for processing exports', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 2,
            status: 'processing',
            format: 'excel',
            lead_count: 50,
            created_at: '2026-02-02T10:00:00Z',
          },
        ],
      })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('Processing')).toBeInTheDocument()
      })
    })

    it('shows Failed badge for failed exports', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 3,
            status: 'failed',
            format: 'csv',
            lead_count: 0,
            created_at: '2026-02-03T10:00:00Z',
            error_message: 'Export failed due to server error',
          },
        ],
      })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument()
      })
    })

    it('shows Pending badge for pending exports', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 4,
            status: 'pending',
            format: 'csv',
            lead_count: 25,
            created_at: '2026-02-04T10:00:00Z',
          },
        ],
      })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument()
      })
    })
  })

  describe('Download', () => {
    it('renders download button for ready exports with file URL', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 1,
            status: 'ready',
            format: 'csv',
            lead_count: 100,
            file_url: 'https://example.com/file.csv',
            created_at: '2026-02-01T10:00:00Z',
          },
        ],
      })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('Download')).toBeInTheDocument()
      })
    })

    it('calls exportsService.download when download button is clicked', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 1,
            status: 'ready',
            format: 'csv',
            lead_count: 100,
            file_url: 'https://example.com/file.csv',
            created_at: '2026-02-01T10:00:00Z',
          },
        ],
      })

      mockDownload.mockResolvedValueOnce(undefined)

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('Download')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Download'))

      await waitFor(() => {
        expect(mockDownload).toHaveBeenCalledWith(1)
      })
    })

    it('does not render download button for processing exports', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 2,
            status: 'processing',
            format: 'excel',
            lead_count: 50,
            created_at: '2026-02-02T10:00:00Z',
          },
        ],
      })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('Processing')).toBeInTheDocument()
      })

      expect(screen.queryByText('Download')).not.toBeInTheDocument()
    })
  })

  describe('Error message display', () => {
    it('displays error message for failed exports', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 3,
            status: 'failed',
            format: 'csv',
            lead_count: 0,
            created_at: '2026-02-03T10:00:00Z',
            error_message: 'Export failed due to server error',
          },
        ],
      })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('Export failed due to server error')).toBeInTheDocument()
      })
    })
  })

  describe('Refresh', () => {
    it('calls loadExports when refresh button is clicked', async () => {
      mockList.mockResolvedValue({ data: [] })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('No exports yet')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Refresh'))

      await waitFor(() => {
        // First call on mount, second on refresh click
        expect(mockList).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Status messages', () => {
    it('shows processing message for processing exports', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 2,
            status: 'processing',
            format: 'excel',
            lead_count: 50,
            created_at: '2026-02-02T10:00:00Z',
          },
        ],
      })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(
          screen.getByText('Your export is being processed. This may take a few moments.')
        ).toBeInTheDocument()
      })
    })

    it('shows pending message for pending exports', async () => {
      mockList.mockResolvedValueOnce({
        data: [
          {
            id: 4,
            status: 'pending',
            format: 'csv',
            lead_count: 25,
            created_at: '2026-02-04T10:00:00Z',
          },
        ],
      })

      render(<ExportsPage />)

      await waitFor(() => {
        expect(
          screen.getByText('Your export is queued for processing.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('API error handling', () => {
    it('handles service error gracefully and shows empty state', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockList.mockRejectedValueOnce(new Error('Network error'))

      render(<ExportsPage />)

      await waitFor(() => {
        expect(screen.getByText('No exports yet')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })
})
