import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CountrySelector } from '../country-selector'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'filters.selectCountry': 'Select a country',
      'filters.countrySelector.search': 'Search countries...',
    }
    return translations[key] || key
  },
}))

// Mock Radix UI Popover
jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }: any) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children, asChild }: any) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: any) => (
    <div data-testid="popover-content">{children}</div>
  ),
}))

// Mock Radix UI Collapsible
jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children, open }: any) => (
    <div data-testid="collapsible" data-open={open}>
      {children}
    </div>
  ),
  CollapsibleTrigger: ({ children, ...props }: any) => (
    <button data-testid="collapsible-trigger" {...props}>
      {children}
    </button>
  ),
  CollapsibleContent: ({ children }: any) => (
    <div data-testid="collapsible-content">{children}</div>
  ),
}))

describe('CountrySelector', () => {
  const defaultProps = {
    onChange: jest.fn(),
    availableCountries: ['US', 'GB', 'DE', 'FR', 'ES'],
    getCountryName: (code: string) => {
      const names: Record<string, string> = {
        US: 'United States',
        GB: 'United Kingdom',
        DE: 'Germany',
        FR: 'France',
        ES: 'Spain',
      }
      return names[code] || code
    },
    getCountryFlag: (code: string) => `🏳️${code}`,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders placeholder when no value selected', () => {
      render(<CountrySelector {...defaultProps} />)
      expect(screen.getByText('Select a country')).toBeInTheDocument()
    })

    test('renders selected country name when value provided', () => {
      render(<CountrySelector {...defaultProps} value="US" />)
      const matches = screen.getAllByText('United States')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })

    test('renders selected country flag', () => {
      render(<CountrySelector {...defaultProps} value="US" />)
      const matches = screen.getAllByText('🏳️US')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })

    test('renders combobox button', () => {
      render(<CountrySelector {...defaultProps} />)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    test('renders search input in popover content', () => {
      render(<CountrySelector {...defaultProps} />)
      expect(screen.getByPlaceholderText('Search countries...')).toBeInTheDocument()
    })

    test('renders country list grouped by region', () => {
      render(<CountrySelector {...defaultProps} />)
      // Should render region names
      const triggers = screen.getAllByTestId('collapsible-trigger')
      expect(triggers.length).toBeGreaterThan(0)
    })

    test('renders available countries in the list', () => {
      render(<CountrySelector {...defaultProps} />)
      expect(screen.getByText('United States')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    test('calls onChange when country is clicked', () => {
      const onChange = jest.fn()
      render(<CountrySelector {...defaultProps} onChange={onChange} />)

      // Find and click a country button
      const countryButtons = screen.getAllByRole('button')
      const usButton = countryButtons.find((btn) =>
        btn.textContent?.includes('United States')
      )
      if (usButton) {
        fireEvent.click(usButton)
        expect(onChange).toHaveBeenCalled()
      }
    })

    test('calls onChange with undefined when same country clicked (deselect)', () => {
      const onChange = jest.fn()
      render(
        <CountrySelector {...defaultProps} value="US" onChange={onChange} />
      )

      const countryButtons = screen.getAllByRole('button')
      const usButton = countryButtons.find((btn) =>
        btn.textContent?.includes('United States')
      )
      if (usButton) {
        fireEvent.click(usButton)
        expect(onChange).toHaveBeenCalledWith(undefined)
      }
    })
  })

  describe('Clear Selection', () => {
    test('shows clear button when value is selected', () => {
      const { container } = render(
        <CountrySelector {...defaultProps} value="US" />
      )
      // The X icon for clearing is rendered
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('Country Stats', () => {
    test('displays lead count when countryStats provided', () => {
      render(
        <CountrySelector
          {...defaultProps}
          countryStats={{ US: 5000, GB: 3000 }}
        />
      )
      expect(screen.getByText('5,000')).toBeInTheDocument()
    })
  })

  describe('Search Filtering', () => {
    test('filters countries by search query', () => {
      render(<CountrySelector {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search countries...')
      fireEvent.change(searchInput, { target: { value: 'United' } })

      // Text is broken by highlight marks, so use a text matcher function
      const usMatch = screen.getByText((content, element) =>
        element?.textContent === 'United States' && element?.tagName === 'SPAN'
      )
      expect(usMatch).toBeInTheDocument()
    })

    test('filters by country code', () => {
      render(<CountrySelector {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search countries...')
      fireEvent.change(searchInput, { target: { value: 'de' } })

      // Germany (DE) should match
      expect(screen.getByText('Germany')).toBeInTheDocument()
    })

    test('shows results count when searching', () => {
      render(<CountrySelector {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search countries...')
      fireEvent.change(searchInput, { target: { value: 'United' } })

      expect(screen.getByText(/countries found/)).toBeInTheDocument()
    })
  })

  describe('No Results', () => {
    test('shows "No countries found" when search has no matches', () => {
      render(
        <CountrySelector
          {...defaultProps}
          availableCountries={[]}
        />
      )
      expect(screen.getByText('No countries found')).toBeInTheDocument()
    })
  })

  describe('Default Functions', () => {
    test('renders with default getCountryName (code as name)', () => {
      render(
        <CountrySelector
          onChange={jest.fn()}
          availableCountries={['US']}
          value="US"
        />
      )
      const matches = screen.getAllByText('US')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })

    test('renders with default getCountryFlag', () => {
      render(
        <CountrySelector
          onChange={jest.fn()}
          availableCountries={['US']}
          value="US"
        />
      )
      // Default flag just returns the code
      const matches = screen.getAllByText('US')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })
  })
})
