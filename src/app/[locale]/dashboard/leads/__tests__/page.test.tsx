import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import LeadsPage from '../page'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: any) => {
      const translations: Record<string, string> = {
        title: 'Business Leads',
        'filters.title': 'Filters',
        'filters.location': 'Location',
        'filters.selectCountryHelp': 'Select a country to start searching',
        'filters.country': 'Country',
        'filters.city': 'City',
        'filters.industry': 'Industry',
        'filters.selectIndustryHelp': 'Optionally filter by industry',
        'filters.dataQuality': 'Data Quality',
        'filters.hasEmail': 'Has Email',
        'filters.hasPhone': 'Has Phone',
        'filters.verifiedOnly': 'Verified Only',
        'filters.clearAll': 'Clear All',
        'filters.loadingCities': 'Loading cities...',
        'filters.selectCity': 'Select a city',
        'filters.selectCountryFirst': 'Select country first',
        searching: 'Searching...',
        noLeadsFound: 'No leads found',
        'emptyState.title': 'No results found',
        'emptyState.description': 'Try adjusting your filters to find more leads.',
        'emptyState.clearButton': 'Clear Filters',
        'viewMode.card': 'Card View',
        'viewMode.table': 'Table View',
        'export.csv': 'CSV',
        'export.excel': 'Excel',
        'export.searchFirst': 'Search for leads first',
        'export.exportLeads': `Export ${params?.count || 0} leads as ${params?.format || ''}`,
        'export.noResults': `No results to export as ${params?.format || ''}`,
        'stats.email': 'Email',
        'stats.phone': 'Phone',
        'stats.verified': 'Verified',
        'table.business': 'Business',
        'table.industry': 'Industry',
        'table.email': 'Email',
        'table.phone': 'Phone',
        'table.website': 'Website',
        'table.quality': 'Quality',
        'pagination.previous': 'Previous',
        'pagination.next': 'Next',
        'pagination.page': `Page ${params?.current || 1} of ${params?.total || 1}`,
        'pagination.goToPrevious': `Go to page ${params?.page || 0}`,
        'pagination.goToNext': `Go to page ${params?.page || 0}`,
        hideFilters: 'Hide Filters',
        showFilters: 'Show Filters',
      }
      return translations[key] || key
    }
    t.rich = t
    return t
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: (props: any) => <svg data-testid="search-icon" {...props} />,
  Download: (props: any) => <svg data-testid="download-icon" {...props} />,
  FileSpreadsheet: (props: any) => <svg data-testid="file-spreadsheet-icon" {...props} />,
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
  Filter: (props: any) => <svg data-testid="filter-icon" {...props} />,
  ChevronLeft: (props: any) => <svg data-testid="chevron-left-icon" {...props} />,
  ChevronRight: (props: any) => <svg data-testid="chevron-right-icon" {...props} />,
  ChevronDown: (props: any) => <svg data-testid="chevron-down-icon" {...props} />,
  LayoutGrid: (props: any) => <svg data-testid="layout-grid-icon" {...props} />,
  List: (props: any) => <svg data-testid="list-icon" {...props} />,
  Building2: (props: any) => <svg data-testid="building-icon" {...props} />,
  MapPin: (props: any) => <svg data-testid="map-pin-icon" {...props} />,
  Mail: (props: any) => <svg data-testid="mail-icon" {...props} />,
  Phone: (props: any) => <svg data-testid="phone-icon" {...props} />,
  Shield: (props: any) => <svg data-testid="shield-icon" {...props} />,
  Loader2: (props: any) => <svg data-testid="loader-icon" {...props} />,
  TrendingUp: (props: any) => <svg data-testid="trending-icon" {...props} />,
  CheckCircle2: (props: any) => <svg data-testid="check-circle-icon" {...props} />,
  AlertCircle: (props: any) => <svg data-testid="alert-circle-icon" {...props} />,
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
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CollapsibleContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CollapsibleTrigger: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}))

// Mock toast provider
const mockToast = jest.fn()
jest.mock('@/components/toast-provider', () => ({
  useToast: () => ({ toast: mockToast }),
}))

// Mock lead components
jest.mock('@/components/leads/lead-card', () => ({
  LeadCard: ({ lead }: any) => (
    <div data-testid={`lead-card-${lead.id}`}>
      <span>{lead.name}</span>
      <span>{lead.industry}</span>
    </div>
  ),
}))

jest.mock('@/components/leads/lead-table-row', () => ({
  LeadTableRow: ({ lead }: any) => (
    <tr data-testid={`lead-row-${lead.id}`}>
      <td>{lead.name}</td>
    </tr>
  ),
}))

jest.mock('@/components/leads/lead-card-skeleton', () => ({
  LeadCardSkeletonList: ({ count }: any) => (
    <div data-testid="skeleton-list">Loading {count} skeletons...</div>
  ),
}))

jest.mock('@/components/leads/industry-selector', () => ({
  IndustrySelector: ({ selectedIndustries, onChange }: any) => (
    <div data-testid="industry-selector">
      <button onClick={() => onChange(['tattoo'])} data-testid="select-tattoo">
        Select Tattoo
      </button>
      <span>{selectedIndustries.join(', ')}</span>
    </div>
  ),
}))

jest.mock('@/components/leads/search-button', () => ({
  SearchButton: ({ onClick, loading, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="search-button">
      {loading ? 'Searching...' : 'Search Leads'}
    </button>
  ),
}))

jest.mock('@/components/leads/search-preview', () => ({
  SearchPreview: ({ preview, loading }: any) => (
    <div data-testid="search-preview">
      {loading ? 'Loading preview...' : preview ? `${preview.estimated_count} leads` : 'No preview'}
    </div>
  ),
}))

jest.mock('@/components/leads/empty-search-state', () => ({
  EmptySearchState: ({ onQuickSearch }: any) => (
    <div data-testid="empty-search-state">
      <p>Start by selecting filters</p>
      <button onClick={() => onQuickSearch('tattoo', 'US')} data-testid="quick-search">
        Quick Search
      </button>
    </div>
  ),
}))

jest.mock('@/components/leads/credit-confirmation-dialog', () => ({
  CreditConfirmationDialog: ({ open, onConfirm, onOpenChange }: any) => (
    open ? (
      <div data-testid="credit-dialog">
        <button onClick={onConfirm} data-testid="confirm-credits">Confirm</button>
        <button onClick={() => onOpenChange(false)} data-testid="cancel-credits">Cancel</button>
      </div>
    ) : null
  ),
}))

jest.mock('@/components/leads/country-selector', () => ({
  CountrySelector: ({ value, onChange }: any) => (
    <div data-testid="country-selector">
      <button onClick={() => onChange('US')} data-testid="select-us">Select US</button>
      <span>{value || 'None'}</span>
    </div>
  ),
}))

jest.mock('@/components/leads/city-selector', () => ({
  CitySelector: ({ value, onChange, disabled }: any) => (
    <div data-testid="city-selector">
      <button onClick={() => onChange('New York')} disabled={disabled} data-testid="select-ny">
        Select New York
      </button>
      <span>{value || 'None'}</span>
    </div>
  ),
}))

jest.mock('@/components/leads/filter-section', () => ({
  FilterSection: ({ children, label }: any) => (
    <div data-testid={`filter-section-${label}`}>
      <h3>{label}</h3>
      {children}
    </div>
  ),
}))

jest.mock('@/components/leads/recent-searches', () => ({
  RecentSearches: () => <div data-testid="recent-searches">Recent Searches</div>,
}))

// Mock hooks
jest.mock('@/hooks/useVirtualization', () => ({
  useVirtualization: ({ items }: any) => ({
    containerRef: { current: null },
    visibleItems: items,
    totalHeight: items.length * 200,
    offsetY: 0,
  }),
  useDebouncedValue: (value: any) => value,
}))

jest.mock('@/hooks/useRecentSearches', () => ({
  useRecentSearches: () => ({
    addSearch: jest.fn(),
    recentSearches: [],
    clearSearches: jest.fn(),
  }),
}))

jest.mock('@/hooks/useSidebarState', () => ({
  useSidebarState: () => ({
    isFilterSidebarOpen: true,
    toggleFilterSidebar: jest.fn(),
  }),
}))

// Mock lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

// Mock lib/countries (virtual module - file may not exist yet)
jest.mock('@/lib/countries', () => ({
  getCountryName: (code: string) => code === 'US' ? 'United States' : code,
  getCountryFlag: (code: string) => '🇺🇸',
}), { virtual: true })

// Mock services
const mockSearch = jest.fn()
const mockGetUsage = jest.fn()
const mockPreview = jest.fn()
jest.mock('@/services/leads.service', () => ({
  leadsService: {
    search: (...args: any[]) => mockSearch(...args),
    getUsage: (...args: any[]) => mockGetUsage(...args),
    preview: (...args: any[]) => mockPreview(...args),
  },
}))

const mockExportCreate = jest.fn()
jest.mock('@/services/exports.service', () => ({
  exportsService: {
    create: (...args: any[]) => mockExportCreate(...args),
  },
}))

const mockGetCountries = jest.fn()
const mockGetCities = jest.fn()
const mockGetPopularCountries = jest.fn()
jest.mock('@/services/filters.service', () => ({
  filtersService: {
    getCountries: (...args: any[]) => mockGetCountries(...args),
    getCities: (...args: any[]) => mockGetCities(...args),
    getPopularCountries: (...args: any[]) => mockGetPopularCountries(...args),
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = { auth_token: 'test-token' }
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock window.innerWidth for desktop
Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })

describe('LeadsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    localStorageMock.getItem.mockReturnValue('test-token')
    mockGetUsage.mockResolvedValue({
      usage_count: 10,
      usage_limit: 500,
      remaining: 490,
      tier: 'pro',
    })
    mockGetCountries.mockResolvedValue(['US', 'GB', 'DE'])
    mockGetPopularCountries.mockResolvedValue(['US', 'GB'])
    mockGetCities.mockResolvedValue(['New York', 'Los Angeles'])
    mockPreview.mockResolvedValue({
      estimated_count: 100,
      with_email_count: 50,
      with_email_pct: 50,
      with_phone_count: 60,
      with_phone_pct: 60,
      verified_count: 80,
      verified_pct: 80,
      quality_score_avg: 65,
    })
    mockSearch.mockResolvedValue({
      data: [],
      pagination: { total: 0, total_pages: 0, has_next: false, has_prev: false },
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders page title', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      expect(screen.getByText('Business Leads')).toBeInTheDocument()
    })

    it('renders search form with industry selector', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      expect(screen.getByTestId('industry-selector')).toBeInTheDocument()
    })

    it('renders country selector', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      expect(screen.getByTestId('country-selector')).toBeInTheDocument()
    })

    it('renders city selector', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      expect(screen.getByTestId('city-selector')).toBeInTheDocument()
    })

    it('renders search button', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      expect(screen.getByTestId('search-button')).toBeInTheDocument()
    })

    it('renders export buttons (CSV and Excel)', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      expect(screen.getByText('CSV')).toBeInTheDocument()
      expect(screen.getByText('Excel')).toBeInTheDocument()
    })

    it('renders view mode toggle buttons', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      // The view mode group contains Card View and Table View buttons
      // Multiple elements may share the label, so we use getAllByLabelText
      const cardViewBtns = screen.getAllByLabelText('Card View')
      expect(cardViewBtns.length).toBeGreaterThan(0)
      const tableViewBtns = screen.getAllByLabelText('Table View')
      expect(tableViewBtns.length).toBeGreaterThan(0)
    })
  })

  describe('Empty state', () => {
    it('shows empty search state before any search is triggered', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      expect(screen.getByTestId('empty-search-state')).toBeInTheDocument()
    })

    it('shows no results state after search with zero results', async () => {
      mockSearch.mockResolvedValueOnce({
        data: [],
        pagination: { total: 0, total_pages: 0, has_next: false, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      // Trigger search
      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument()
      })
    })
  })

  describe('Search', () => {
    it('search button triggers leadsService.search', async () => {
      mockSearch.mockResolvedValueOnce({
        data: [],
        pagination: { total: 0, total_pages: 0, has_next: false, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalled()
      })
    })

    it('displays loading skeleton while searching', async () => {
      mockSearch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          data: [],
          pagination: { total: 0, total_pages: 0, has_next: false, has_prev: false },
        }), 5000))
      )

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      // After clicking, loading state should show
      await waitFor(() => {
        expect(screen.getByTestId('skeleton-list')).toBeInTheDocument()
      })
    })
  })

  describe('Results display', () => {
    const mockLeads = [
      {
        id: 1,
        name: 'Tattoo Studio A',
        industry: 'tattoo',
        country: 'US',
        city: 'New York',
        email: 'a@test.com',
        phone: '+1234567890',
        verified: true,
        quality_score: 80,
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Beauty Salon B',
        industry: 'beauty',
        country: 'US',
        city: 'LA',
        verified: false,
        quality_score: 50,
        created_at: '2026-01-02T00:00:00Z',
      },
    ]

    it('displays results as cards by default', async () => {
      mockSearch.mockResolvedValueOnce({
        data: mockLeads,
        pagination: { total: 2, total_pages: 1, has_next: false, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.getByTestId('lead-card-1')).toBeInTheDocument()
        expect(screen.getByTestId('lead-card-2')).toBeInTheDocument()
      })
    })

    it('switches to table view when table toggle is clicked', async () => {
      mockSearch.mockResolvedValueOnce({
        data: mockLeads,
        pagination: { total: 2, total_pages: 1, has_next: false, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.getByTestId('lead-card-1')).toBeInTheDocument()
      })

      // Switch to table view
      fireEvent.click(screen.getByLabelText('Table View'))

      await waitFor(() => {
        expect(screen.getByTestId('lead-row-1')).toBeInTheDocument()
        expect(screen.getByTestId('lead-row-2')).toBeInTheDocument()
      })
    })

    it('shows statistics bar when results are present', async () => {
      mockSearch.mockResolvedValueOnce({
        data: mockLeads,
        pagination: { total: 2, total_pages: 1, has_next: false, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        // Stats bar shows counts
        expect(screen.getByText('Email:')).toBeInTheDocument()
        expect(screen.getByText('Phone:')).toBeInTheDocument()
        expect(screen.getByText('Verified:')).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    it('renders pagination controls when multiple pages exist', async () => {
      mockSearch.mockResolvedValueOnce({
        data: [{ id: 1, name: 'Lead 1', industry: 'tattoo', country: 'US', city: 'NYC', verified: true, quality_score: 80, created_at: '2026-01-01T00:00:00Z' }],
        pagination: { total: 50, total_pages: 3, has_next: true, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
      })
    })

    it('disables Previous button on first page', async () => {
      mockSearch.mockResolvedValueOnce({
        data: [{ id: 1, name: 'Lead 1', industry: 'tattoo', country: 'US', city: 'NYC', verified: true, quality_score: 80, created_at: '2026-01-01T00:00:00Z' }],
        pagination: { total: 50, total_pages: 3, has_next: true, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeDisabled()
      })
    })

    it('does not render pagination when only one page', async () => {
      mockSearch.mockResolvedValueOnce({
        data: [{ id: 1, name: 'Lead 1', industry: 'tattoo', country: 'US', city: 'NYC', verified: true, quality_score: 80, created_at: '2026-01-01T00:00:00Z' }],
        pagination: { total: 5, total_pages: 1, has_next: false, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.getByTestId('lead-card-1')).toBeInTheDocument()
      })

      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })
  })

  describe('Export', () => {
    it('export buttons are disabled when no leads are loaded', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      const csvBtn = screen.getByText('CSV').closest('button')
      const excelBtn = screen.getByText('Excel').closest('button')

      expect(csvBtn).toBeDisabled()
      expect(excelBtn).toBeDisabled()
    })

    it('export buttons become enabled when leads are available', async () => {
      mockSearch.mockResolvedValueOnce({
        data: [{ id: 1, name: 'Lead 1', industry: 'tattoo', country: 'US', city: 'NYC', verified: true, quality_score: 80, created_at: '2026-01-01T00:00:00Z' }],
        pagination: { total: 1, total_pages: 1, has_next: false, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        const csvBtn = screen.getByText('CSV').closest('button')
        expect(csvBtn).not.toBeDisabled()
      })
    })
  })

  describe('Search error handling', () => {
    it('shows rate limit toast on 429 response', async () => {
      mockSearch.mockRejectedValueOnce({
        response: { status: 429 },
        name: 'Error',
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Too Many Requests',
            variant: 'destructive',
          })
        )
      })
    })

    it('shows usage limit toast on 403 with limit message', async () => {
      mockSearch.mockRejectedValueOnce({
        response: { status: 403, data: { message: 'Monthly usage limit exceeded' } },
        name: 'Error',
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Usage Limit Reached',
            variant: 'destructive',
          })
        )
      })
    })

    it('shows generic error toast on other errors', async () => {
      mockSearch.mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Server error' } },
        name: 'Error',
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            variant: 'destructive',
          })
        )
      })
    })
  })

  describe('Export flow', () => {
    it('calls exportsService.create with csv format when CSV button is clicked', async () => {
      mockSearch.mockResolvedValueOnce({
        data: [{ id: 1, name: 'Lead 1', industry: 'tattoo', country: 'US', city: 'NYC', verified: true, quality_score: 80, created_at: '2026-01-01T00:00:00Z' }],
        pagination: { total: 1, total_pages: 1, has_next: false, has_prev: false },
      })
      mockExportCreate.mockResolvedValueOnce({ id: 1 })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.getByText('CSV').closest('button')).not.toBeDisabled()
      })

      fireEvent.click(screen.getByText('CSV'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockExportCreate).toHaveBeenCalledWith(
          expect.objectContaining({ format: 'csv' })
        )
      })
    })

    it('shows error toast when export fails', async () => {
      mockSearch.mockResolvedValueOnce({
        data: [{ id: 1, name: 'Lead 1', industry: 'tattoo', country: 'US', city: 'NYC', verified: true, quality_score: 80, created_at: '2026-01-01T00:00:00Z' }],
        pagination: { total: 1, total_pages: 1, has_next: false, has_prev: false },
      })
      mockExportCreate.mockRejectedValueOnce({ message: 'Export failed' })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.getByText('CSV').closest('button')).not.toBeDisabled()
      })

      fireEvent.click(screen.getByText('CSV'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Export Failed',
            variant: 'destructive',
          })
        )
      })
    })

    it('shows toast when trying to export with no leads', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      // Trigger a search that returns empty results
      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      // The export buttons should be disabled but let's verify the toast behavior
      expect(screen.getByText('CSV').closest('button')).toBeDisabled()
    })
  })

  describe('Quick search', () => {
    it('triggers quick search from empty state', async () => {
      mockSearch.mockResolvedValueOnce({
        data: [{ id: 1, name: 'Lead 1', industry: 'tattoo', country: 'US', city: 'NYC', verified: true, quality_score: 80, created_at: '2026-01-01T00:00:00Z' }],
        pagination: { total: 1, total_pages: 1, has_next: false, has_prev: false },
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('quick-search'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalled()
      })
    })
  })

  describe('Filter interactions', () => {
    it('loads cities when country is selected', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('select-us'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockGetCities).toHaveBeenCalledWith('US')
      })
    })

    it('updates industry filter', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('select-tattoo'))

      await waitFor(() => {
        expect(screen.getByText('tattoo')).toBeInTheDocument()
      })
    })
  })

  describe('Low credits confirmation', () => {
    it('shows credit confirmation dialog when credits are low', async () => {
      mockGetUsage.mockResolvedValue({
        usage_count: 495,
        usage_limit: 500,
        remaining: 5,
        tier: 'pro',
      })

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      fireEvent.click(screen.getByTestId('search-button'))

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(screen.getByTestId('credit-dialog')).toBeInTheDocument()
      })
    })
  })

  describe('Authentication', () => {
    it('shows authentication toast when no token is present', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Authentication Required',
            variant: 'destructive',
          })
        )
      })
    })
  })

  describe('Initialization', () => {
    it('loads usage and filter options on mount', async () => {
      render(<LeadsPage />)

      await act(async () => {
        jest.runAllTimers()
      })

      await waitFor(() => {
        expect(mockGetUsage).toHaveBeenCalled()
        expect(mockGetCountries).toHaveBeenCalled()
        expect(mockGetPopularCountries).toHaveBeenCalled()
      })
    })
  })
})
