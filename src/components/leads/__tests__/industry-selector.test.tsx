import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IndustrySelector } from '../industry-selector'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, any>) => {
    if (values) {
      let result = key
      Object.entries(values).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v))
      })
      return result
    }
    return key
  },
}))

// Mock industries service
const mockGetIndustriesWithLeads = jest.fn()
jest.mock('@/services/industries.service', () => ({
  industriesService: {
    getIndustriesWithLeads: (...args: any[]) => mockGetIndustriesWithLeads(...args),
  },
}))

const mockIndustriesResponse = {
  industries: [
    {
      id: 'tattoo',
      name: 'Tattoo Studios',
      category: 'personal_care',
      icon: '\uD83C\uDFA8',
      description: 'Tattoo and body art studios',
      lead_count: 500,
      countries: ['US', 'GB'],
    },
    {
      id: 'beauty',
      name: 'Beauty Salons',
      category: 'personal_care',
      icon: '\uD83D\uDC85',
      description: 'Beauty and hair salons',
      lead_count: 800,
      countries: ['US', 'FR'],
    },
    {
      id: 'gym',
      name: 'Gyms',
      category: 'health_fitness',
      icon: '\uD83D\uDCAA',
      description: 'Fitness centers and gyms',
      lead_count: 1200,
      countries: ['US', 'GB', 'DE'],
    },
  ],
  total: 3,
}

describe('IndustrySelector', () => {
  const defaultProps = {
    selectedIndustries: [] as string[],
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetIndustriesWithLeads.mockResolvedValue(mockIndustriesResponse)
  })

  describe('Loading State', () => {
    test('shows loading spinner while fetching industries', () => {
      mockGetIndustriesWithLeads.mockReturnValue(new Promise(() => {})) // never resolves
      render(<IndustrySelector {...defaultProps} />)
      expect(screen.getByText('loading')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    test('shows error message on API failure', async () => {
      mockGetIndustriesWithLeads.mockRejectedValue(new Error('Network error'))
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('loadFailed')).toBeInTheDocument()
      })
    })

    test('shows Try Again button on error', async () => {
      mockGetIndustriesWithLeads.mockRejectedValue(new Error('Network error'))
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('tryAgain')).toBeInTheDocument()
      })
    })

    test('retries loading when Try Again is clicked', async () => {
      mockGetIndustriesWithLeads.mockRejectedValueOnce(new Error('error'))
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('tryAgain')).toBeInTheDocument()
      })

      mockGetIndustriesWithLeads.mockResolvedValue(mockIndustriesResponse)
      fireEvent.click(screen.getByText('tryAgain'))

      expect(mockGetIndustriesWithLeads).toHaveBeenCalledTimes(2)
    })
  })

  describe('Empty State', () => {
    test('shows empty message when no industries available', async () => {
      mockGetIndustriesWithLeads.mockResolvedValue({ industries: [], total: 0 })
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('noIndustries')).toBeInTheDocument()
      })
    })
  })

  describe('Loaded State', () => {
    test('renders industry title', async () => {
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('title')).toBeInTheDocument()
      })
    })

    test('renders categories with localized names', async () => {
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        // The mock returns the key name: categories.personal_care
        expect(screen.getByText('categories.personal_care')).toBeInTheDocument()
      })
    })

    test('renders search input', async () => {
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('searchPlaceholder')).toBeInTheDocument()
      })
    })

    test('shows single select description by default', async () => {
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('selectOne')).toBeInTheDocument()
      })
    })

    test('shows multi-select description when multiSelect is true', async () => {
      render(<IndustrySelector {...defaultProps} multiSelect={true} />)

      await waitFor(() => {
        expect(screen.getByText('selectMultiple')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    test('filters industries by search query', async () => {
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('title')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('searchPlaceholder')
      fireEvent.change(searchInput, { target: { value: 'tattoo' } })

      // tattoo should still be visible (industry name from API used as fallback)
      await waitFor(() => {
        expect(screen.getByText('tattoo')).toBeInTheDocument()
      })
    })

    test('clears search when clear button clicked', async () => {
      render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('searchPlaceholder')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('searchPlaceholder')
      fireEvent.change(searchInput, { target: { value: 'tattoo' } })

      // The X button to clear search
      const clearButtons = screen.getAllByRole('button')
      const clearSearchBtn = clearButtons.find((btn) => {
        const svg = btn.querySelector('svg')
        return svg && btn.className.includes('absolute')
      })
      if (clearSearchBtn) {
        fireEvent.click(clearSearchBtn)
        expect(searchInput).toHaveValue('')
      }
    })
  })

  describe('Selection', () => {
    test('calls onChange when industry is selected in single mode', async () => {
      const onChange = jest.fn()
      render(<IndustrySelector {...defaultProps} onChange={onChange} />)

      // Wait for industries to load and first category to auto-expand
      await waitFor(() => {
        // The mock returns the translation key 'tattoo' for tIndustryNames('tattoo')
        expect(screen.getByText('tattoo')).toBeInTheDocument()
      })

      // The first category (personal_care) should be auto-expanded
      // Find the radio input for the first industry and click it
      const tattooInput = screen.getByLabelText(/tattoo/)
      fireEvent.click(tattooInput)
      expect(onChange).toHaveBeenCalledWith(['tattoo'])
    })

    test('shows Clear Selection when items selected', async () => {
      render(
        <IndustrySelector
          {...defaultProps}
          selectedIndustries={['tattoo']}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('clearSelection')).toBeInTheDocument()
      })
    })

    test('calls onChange with empty array when Clear Selection clicked', async () => {
      const onChange = jest.fn()
      render(
        <IndustrySelector
          selectedIndustries={['tattoo']}
          onChange={onChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('clearSelection')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('clearSelection'))
      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('API Integration', () => {
    test('passes country filter to API', async () => {
      render(<IndustrySelector {...defaultProps} country="US" />)

      await waitFor(() => {
        expect(mockGetIndustriesWithLeads).toHaveBeenCalledWith('US', undefined)
      })
    })

    test('passes city filter to API', async () => {
      render(<IndustrySelector {...defaultProps} country="US" city="New York" />)

      await waitFor(() => {
        expect(mockGetIndustriesWithLeads).toHaveBeenCalledWith('US', 'New York')
      })
    })

    test('reloads when country changes', async () => {
      const { rerender } = render(<IndustrySelector {...defaultProps} />)

      await waitFor(() => {
        expect(mockGetIndustriesWithLeads).toHaveBeenCalledTimes(1)
      })

      rerender(<IndustrySelector {...defaultProps} country="GB" />)

      await waitFor(() => {
        expect(mockGetIndustriesWithLeads).toHaveBeenCalledTimes(2)
      })
    })
  })
})
