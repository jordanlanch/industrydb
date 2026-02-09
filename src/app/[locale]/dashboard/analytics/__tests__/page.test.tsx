import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import AnalyticsPage from '../page'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: any) => {
      const translations: Record<string, string> = {
        title: 'Analytics',
        subtitle: 'Track your usage and activity over time',
        loading: 'Loading analytics...',
        error: 'Error',
        'timeRange.placeholder': 'Select time range',
        'timeRange.last7Days': 'Last 7 Days',
        'timeRange.last30Days': 'Last 30 Days',
        'timeRange.last60Days': 'Last 60 Days',
        'timeRange.last90Days': 'Last 90 Days',
        'timeRange.last6Months': 'Last 6 Months',
        'timeRange.lastYear': 'Last Year',
        'stats.totalSearches': 'Total Searches',
        'stats.totalExports': 'Total Exports',
        'stats.totalLeads': 'Total Leads',
        'stats.peakDay': 'Peak Day',
        'stats.days': `Last ${params?.count || 30} days`,
        'stats.noActivity': 'No activity yet',
        'stats.avgPerDay': `${params?.value || 0} avg per day`,
        'charts.dailyUsage': 'Daily Usage',
        'charts.dailyUsageDesc': `Your usage over the last ${params?.days || 30} days`,
        'charts.actionBreakdown': 'Action Breakdown',
        'charts.actionBreakdownDesc': 'Distribution of your activity types',
        'charts.searches': 'Searches',
        'charts.exports': 'Exports',
        'charts.actions': 'Actions',
        actionSummary: 'Action Summary',
        'table.title': 'Daily Usage Details',
        'table.description': 'Detailed day-by-day usage breakdown',
        'table.date': 'Date',
        'table.searches': 'Searches',
        'table.exports': 'Exports',
        'table.total': 'Total',
        'table.showing': `Showing 10 of ${params?.total || 0} days`,
        'noData.title': 'No Data Available',
        'noData.description': 'Start using IndustryDB to see your analytics here.',
      }
      return translations[key] || key
    }
    t.rich = t
    return t
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  TrendingUp: (props: any) => <svg data-testid="trending-icon" {...props} />,
  Search: (props: any) => <svg data-testid="search-icon" {...props} />,
  FileDown: (props: any) => <svg data-testid="file-down-icon" {...props} />,
  Activity: (props: any) => <svg data-testid="activity-icon" {...props} />,
  Calendar: (props: any) => <svg data-testid="calendar-icon" {...props} />,
}))

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select-root" data-value={value}>
      {React.Children.map(children, (child: any) =>
        child ? React.cloneElement(child, { onValueChange, currentValue: value }) : null
      )}
    </div>
  ),
  SelectTrigger: ({ children, ...props }: any) => (
    <button data-testid="select-trigger" {...props}>{children}</button>
  ),
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
  SelectContent: ({ children, onValueChange }: any) => (
    <div data-testid="select-content">
      {React.Children.map(children, (child: any) =>
        child ? React.cloneElement(child, { onValueChange }) : null
      )}
    </div>
  ),
  SelectItem: ({ children, value, onValueChange }: any) => (
    <button
      data-testid={`select-item-${value}`}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  ),
}))

// Mock chart.js and react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: ({ data }: any) => (
    <div data-testid="line-chart">
      <span>Line chart with {data?.datasets?.[0]?.data?.length || 0} data points</span>
    </div>
  ),
  Doughnut: ({ data }: any) => (
    <div data-testid="doughnut-chart">
      <span>Doughnut chart with {data?.labels?.length || 0} segments</span>
    </div>
  ),
}))

jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: 'CategoryScale',
  LinearScale: 'LinearScale',
  PointElement: 'PointElement',
  LineElement: 'LineElement',
  ArcElement: 'ArcElement',
  Title: 'Title',
  Tooltip: 'Tooltip',
  Legend: 'Legend',
  Filler: 'Filler',
}))

// Mock analytics service
const mockGetDailyUsage = jest.fn()
const mockGetUsageSummary = jest.fn()
const mockGetActionBreakdown = jest.fn()
jest.mock('@/services/analytics.service', () => ({
  __esModule: true,
  default: {
    getDailyUsage: (...args: any[]) => mockGetDailyUsage(...args),
    getUsageSummary: (...args: any[]) => mockGetUsageSummary(...args),
    getActionBreakdown: (...args: any[]) => mockGetActionBreakdown(...args),
  },
  DailyUsage: {},
  UsageSummary: {},
  ActionBreakdown: {},
}))

const mockDailyUsageData = [
  { date: '2026-01-25', search: 12, export: 3, total: 15 },
  { date: '2026-01-26', search: 8, export: 5, total: 13 },
  { date: '2026-01-27', search: 20, export: 7, total: 27 },
  { date: '2026-01-28', search: 5, export: 2, total: 7 },
  { date: '2026-01-29', search: 15, export: 4, total: 19 },
]

const mockSummaryData = {
  total_searches: 245,
  total_exports: 89,
  total_leads: 1500,
  avg_per_day: 8.2,
  peak_day: '2026-01-27',
  peak_count: 27,
}

const mockBreakdownData = [
  { action: 'search', count: 245, percentage: 65.3 },
  { action: 'export', count: 89, percentage: 23.7 },
  { action: 'view', count: 41, percentage: 11.0 },
]

describe('AnalyticsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetDailyUsage.mockResolvedValue({ daily_usage: mockDailyUsageData, days: 30 })
    mockGetUsageSummary.mockResolvedValue(mockSummaryData)
    mockGetActionBreakdown.mockResolvedValue({ breakdown: mockBreakdownData, days: 30 })
  })

  describe('Loading state', () => {
    it('shows loading indicator while fetching analytics', async () => {
      mockGetDailyUsage.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ daily_usage: [], days: 30 }), 5000))
      )
      mockGetUsageSummary.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockSummaryData), 5000))
      )
      mockGetActionBreakdown.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ breakdown: [], days: 30 }), 5000))
      )

      render(<AnalyticsPage />)

      expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
    })
  })

  describe('Rendering', () => {
    it('renders page title and subtitle', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument()
        expect(screen.getByText('Track your usage and activity over time')).toBeInTheDocument()
      })
    })

    it('renders summary statistics cards', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Total Searches')).toBeInTheDocument()
        expect(screen.getByText('Total Exports')).toBeInTheDocument()
        expect(screen.getByText('Total Leads')).toBeInTheDocument()
        expect(screen.getByText('Peak Day')).toBeInTheDocument()
      })
    })

    it('renders summary statistics values', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        // Values appear in summary cards and potentially in breakdown list
        const cards = screen.getAllByTestId('card')
        expect(cards.length).toBeGreaterThan(0)
      })

      // Check that numeric values from summary data are present somewhere
      // 245 appears in summary card + breakdown list
      expect(screen.getAllByText('245').length).toBeGreaterThanOrEqual(1)
      // 89 appears in summary card + breakdown list
      expect(screen.getAllByText('89').length).toBeGreaterThanOrEqual(1)
      // 1500 only in summary card (may be formatted)
      const leads = screen.queryByText('1500') || screen.queryByText('1,500')
      expect(leads).toBeTruthy()
      // 27 is peak count (also in daily table)
      expect(screen.getAllByText('27').length).toBeGreaterThanOrEqual(1)
    })

    it('renders usage charts', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
        expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
      })
    })

    it('renders chart section titles', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Daily Usage')).toBeInTheDocument()
        expect(screen.getByText('Action Breakdown')).toBeInTheDocument()
      })
    })

    it('renders action breakdown list', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Action Summary')).toBeInTheDocument()
        expect(screen.getByText('search')).toBeInTheDocument()
        expect(screen.getByText('export')).toBeInTheDocument()
        expect(screen.getByText('view')).toBeInTheDocument()
      })
    })

    it('renders daily usage data table', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Daily Usage Details')).toBeInTheDocument()
        // Check table headers
        expect(screen.getByText('Date')).toBeInTheDocument()
      })
    })
  })

  describe('Date range selection', () => {
    it('renders time range selector', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('select-trigger')).toBeInTheDocument()
      })
    })

    it('fetches data with default 30 days', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(mockGetDailyUsage).toHaveBeenCalledWith(30)
        expect(mockGetUsageSummary).toHaveBeenCalledWith(30)
        expect(mockGetActionBreakdown).toHaveBeenCalledWith(30)
      })
    })

    it('refetches data when time range changes', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(mockGetDailyUsage).toHaveBeenCalledWith(30)
      })

      // Change to 7 days
      fireEvent.click(screen.getByTestId('select-item-7'))

      await waitFor(() => {
        expect(mockGetDailyUsage).toHaveBeenCalledWith(7)
        expect(mockGetUsageSummary).toHaveBeenCalledWith(7)
        expect(mockGetActionBreakdown).toHaveBeenCalledWith(7)
      })
    })

    it('shows all time range options', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('select-item-7')).toBeInTheDocument()
        expect(screen.getByTestId('select-item-30')).toBeInTheDocument()
        expect(screen.getByTestId('select-item-60')).toBeInTheDocument()
        expect(screen.getByTestId('select-item-90')).toBeInTheDocument()
        expect(screen.getByTestId('select-item-180')).toBeInTheDocument()
        expect(screen.getByTestId('select-item-365')).toBeInTheDocument()
      })
    })
  })

  describe('Empty state', () => {
    it('shows no data state when no daily usage', async () => {
      mockGetDailyUsage.mockResolvedValueOnce({ daily_usage: [], days: 30 })
      mockGetUsageSummary.mockResolvedValueOnce({
        total_searches: 0,
        total_exports: 0,
        total_leads: 0,
        avg_per_day: 0,
        peak_day: '',
        peak_count: 0,
      })
      mockGetActionBreakdown.mockResolvedValueOnce({ breakdown: [], days: 30 })

      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('No Data Available')).toBeInTheDocument()
        expect(screen.getByText('Start using IndustryDB to see your analytics here.')).toBeInTheDocument()
      })
    })
  })

  describe('Error state', () => {
    it('shows error message on API failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockGetDailyUsage.mockRejectedValueOnce({
        response: { data: { message: 'Server error occurred' } },
      })
      mockGetUsageSummary.mockRejectedValueOnce(new Error('Fail'))
      mockGetActionBreakdown.mockRejectedValueOnce(new Error('Fail'))

      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
        expect(screen.getByText('Server error occurred')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('API integration', () => {
    it('calls all three analytics endpoints on mount', async () => {
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(mockGetDailyUsage).toHaveBeenCalledTimes(1)
        expect(mockGetUsageSummary).toHaveBeenCalledTimes(1)
        expect(mockGetActionBreakdown).toHaveBeenCalledTimes(1)
      })
    })
  })
})
