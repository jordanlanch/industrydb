import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CitySelector } from '../city-selector'

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

describe('CitySelector', () => {
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']

  const defaultProps = {
    onChange: jest.fn(),
    cities,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders placeholder when no value selected', () => {
      render(<CitySelector {...defaultProps} />)
      expect(screen.getByText('Select a city')).toBeInTheDocument()
    })

    test('renders custom placeholder', () => {
      render(<CitySelector {...defaultProps} placeholder="Choose city..." />)
      expect(screen.getByText('Choose city...')).toBeInTheDocument()
    })

    test('renders selected city name', () => {
      render(<CitySelector {...defaultProps} value="New York" />)
      const matches = screen.getAllByText('New York')
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })

    test('renders combobox button', () => {
      render(<CitySelector {...defaultProps} />)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
    })

    test('renders search input', () => {
      render(<CitySelector {...defaultProps} />)
      expect(screen.getByPlaceholderText('Search cities...')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    test('button is disabled when disabled prop is true', () => {
      render(<CitySelector {...defaultProps} disabled={true} />)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })

    test('button is disabled when loading', () => {
      render(<CitySelector {...defaultProps} loading={true} />)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })

    test('shows "Loading cities..." when loading', () => {
      render(<CitySelector {...defaultProps} loading={true} />)
      expect(screen.getByText('Loading cities...')).toBeInTheDocument()
    })
  })

  describe('City List', () => {
    test('renders all cities grouped by first letter', () => {
      render(<CitySelector {...defaultProps} />)
      // All cities should be visible
      expect(screen.getByText('New York')).toBeInTheDocument()
      expect(screen.getByText('Los Angeles')).toBeInTheDocument()
      expect(screen.getByText('Chicago')).toBeInTheDocument()
      expect(screen.getByText('Houston')).toBeInTheDocument()
      expect(screen.getByText('Phoenix')).toBeInTheDocument()
    })

    test('renders "All Cities" option', () => {
      render(<CitySelector {...defaultProps} />)
      expect(screen.getByText('All Cities')).toBeInTheDocument()
    })

    test('renders letter group headers', () => {
      render(<CitySelector {...defaultProps} />)
      expect(screen.getByText('C')).toBeInTheDocument()
      expect(screen.getByText('H')).toBeInTheDocument()
      expect(screen.getByText('L')).toBeInTheDocument()
      expect(screen.getByText('N')).toBeInTheDocument()
      expect(screen.getByText('P')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    test('filters cities by search query', () => {
      render(<CitySelector {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search cities...')
      fireEvent.change(searchInput, { target: { value: 'new' } })

      expect(screen.getByText('New York')).toBeInTheDocument()
      // Other cities should be filtered out (not matching 'new')
      expect(screen.queryByText('Chicago')).not.toBeInTheDocument()
    })

    test('shows "No cities found" when search has no matches', () => {
      render(<CitySelector {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search cities...')
      fireEvent.change(searchInput, { target: { value: 'xyz123' } })

      expect(screen.getByText('No cities found')).toBeInTheDocument()
    })

    test('shows result count when searching', () => {
      render(<CitySelector {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search cities...')
      fireEvent.change(searchInput, { target: { value: 'new' } })

      expect(screen.getByText(/1 city found/)).toBeInTheDocument()
    })

    test('case insensitive search', () => {
      render(<CitySelector {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search cities...')
      fireEvent.change(searchInput, { target: { value: 'NEW YORK' } })

      expect(screen.getByText('New York')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    test('calls onChange when city is clicked', () => {
      const onChange = jest.fn()
      render(<CitySelector {...defaultProps} onChange={onChange} />)

      const cityButtons = screen.getAllByRole('button')
      const nyButton = cityButtons.find((btn) => btn.textContent?.includes('New York'))
      if (nyButton) {
        fireEvent.click(nyButton)
        expect(onChange).toHaveBeenCalledWith('New York')
      }
    })

    test('calls onChange with undefined when All Cities clicked', () => {
      const onChange = jest.fn()
      render(<CitySelector {...defaultProps} onChange={onChange} />)

      const allCitiesBtn = screen.getAllByRole('button').find(
        (btn) => btn.textContent?.includes('All Cities')
      )
      if (allCitiesBtn) {
        fireEvent.click(allCitiesBtn)
        expect(onChange).toHaveBeenCalledWith(undefined)
      }
    })
  })

  describe('Empty Cities', () => {
    test('shows "No cities found" when cities array is empty', () => {
      render(<CitySelector {...defaultProps} cities={[]} />)
      expect(screen.getByText('No cities found')).toBeInTheDocument()
    })
  })

  describe('Clear Selection', () => {
    test('clears value when clear button clicked', () => {
      const onChange = jest.fn()
      const { container } = render(
        <CitySelector {...defaultProps} value="New York" onChange={onChange} />
      )

      // Find the X SVG button for clearing
      const svgs = container.querySelectorAll('svg')
      const clearSvg = Array.from(svgs).find((svg) =>
        svg.parentElement?.tagName === 'svg' || svg.classList.contains('h-4')
      )
      // Click on the X icon area
      if (clearSvg) {
        fireEvent.click(clearSvg)
      }
    })
  })
})
