import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdvancedFilterPanel, type FilterState } from '../advanced-filter-panel'

// Mock IndustrySelectorV2
jest.mock('../industry-selector-v2', () => ({
  IndustrySelectorV2: ({ selections, onChange }: any) => (
    <div data-testid="industry-selector-v2">
      <button
        data-testid="select-industry"
        onClick={() =>
          onChange([{ industryId: 'tattoo', industryName: 'Tattoo Studios' }])
        }
      >
        Select Industry
      </button>
      <span>Selections: {selections.length}</span>
    </div>
  ),
}))

// Mock Radix UI Collapsible to always show content
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

// Mock Radix UI Select
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <div data-testid="select">
      {children}
      <select
        data-testid="select-native"
        value={value || ''}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <option value="">Select</option>
        <option value="US">United States</option>
        <option value="GB">United Kingdom</option>
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

// Mock Radix UI Checkbox
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ id, checked, onChange, onCheckedChange }: any) => (
    <input
      type="checkbox"
      id={id}
      data-testid={`checkbox-${id}`}
      checked={checked || false}
      onChange={(e) => {
        if (onChange) onChange(e);
        if (onCheckedChange) onCheckedChange(e.target.checked);
      }}
    />
  ),
}))

// Mock Radix UI Slider
jest.mock('@/components/ui/slider', () => ({
  Slider: ({ id, value, onValueChange, min, max }: any) => (
    <input
      type="range"
      id={id}
      data-testid={`slider-${id}`}
      value={value?.[0] || min}
      min={min}
      max={max}
      onChange={(e) => onValueChange([Number(e.target.value)])}
    />
  ),
}))

const emptyFilters: FilterState = {
  selections: [],
}

const filtersWithIndustry: FilterState = {
  selections: [{ industryId: 'restaurant', industryName: 'Restaurants' }],
  country: 'US',
  city: 'New York',
  hasEmail: true,
  hasPhone: false,
  hasWebsite: false,
  verified: false,
  qualityScoreMin: 0,
  qualityScoreMax: 100,
}

describe('AdvancedFilterPanel', () => {
  const defaultProps = {
    filters: emptyFilters,
    onChange: jest.fn(),
    onSearch: jest.fn(),
    onClear: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders Advanced Filters title', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
    })

    test('renders all filter section headers', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByText('Industry & Sub-niche')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
      expect(screen.getByText('Data Quality')).toBeInTheDocument()
    })

    test('renders IndustrySelectorV2', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByTestId('industry-selector-v2')).toBeInTheDocument()
    })

    test('renders country select', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByText('Country')).toBeInTheDocument()
    })

    test('renders city input', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByPlaceholderText('e.g. New York')).toBeInTheDocument()
    })

    test('renders radius slider', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByText(/Radius/)).toBeInTheDocument()
    })

    test('renders data quality checkboxes', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByText('Has Email')).toBeInTheDocument()
      expect(screen.getByText('Has Phone')).toBeInTheDocument()
      expect(screen.getByText('Has Website')).toBeInTheDocument()
      expect(screen.getByText('Verified Only')).toBeInTheDocument()
    })

    test('renders quality score range label', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByText(/Quality Score Range/)).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    test('renders Search Leads button', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByText('Search Leads')).toBeInTheDocument()
    })

    test('renders Clear All button', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })

    test('calls onSearch when Search Leads clicked', () => {
      const onSearch = jest.fn()
      render(<AdvancedFilterPanel {...defaultProps} onSearch={onSearch} />)
      fireEvent.click(screen.getByText('Search Leads'))
      expect(onSearch).toHaveBeenCalledTimes(1)
    })

    test('calls onClear when Clear All clicked', () => {
      const onClear = jest.fn()
      render(<AdvancedFilterPanel {...defaultProps} onClear={onClear} />)
      fireEvent.click(screen.getByText('Clear All'))
      expect(onClear).toHaveBeenCalledTimes(1)
    })

    test('renders Save Search button when showSaveButton is true', () => {
      const onSave = jest.fn()
      render(
        <AdvancedFilterPanel
          {...defaultProps}
          showSaveButton={true}
          onSave={onSave}
        />
      )
      expect(screen.getByText('Save Search')).toBeInTheDocument()
    })

    test('does not render Save Search button by default', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.queryByText('Save Search')).not.toBeInTheDocument()
    })

    test('calls onSave when Save Search clicked', () => {
      const onSave = jest.fn()
      render(
        <AdvancedFilterPanel
          {...defaultProps}
          showSaveButton={true}
          onSave={onSave}
        />
      )
      fireEvent.click(screen.getByText('Save Search'))
      expect(onSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('Filter Changes', () => {
    test('calls onChange when industry is selected', () => {
      const onChange = jest.fn()
      render(<AdvancedFilterPanel {...defaultProps} onChange={onChange} />)

      fireEvent.click(screen.getByTestId('select-industry'))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selections: [{ industryId: 'tattoo', industryName: 'Tattoo Studios' }],
        })
      )
    })

    test('calls onChange when city input changes', () => {
      const onChange = jest.fn()
      render(<AdvancedFilterPanel {...defaultProps} onChange={onChange} />)

      const cityInput = screen.getByPlaceholderText('e.g. New York')
      fireEvent.change(cityInput, { target: { value: 'Los Angeles' } })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ city: 'Los Angeles' })
      )
    })

    test('calls onChange when hasEmail checkbox is checked', () => {
      const onChange = jest.fn()
      render(<AdvancedFilterPanel {...defaultProps} onChange={onChange} />)

      const emailCheckbox = screen.getByTestId('checkbox-has-email')
      fireEvent.click(emailCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hasEmail: true })
      )
    })

    test('calls onChange when hasPhone checkbox is checked', () => {
      const onChange = jest.fn()
      render(<AdvancedFilterPanel {...defaultProps} onChange={onChange} />)

      const phoneCheckbox = screen.getByTestId('checkbox-has-phone')
      fireEvent.click(phoneCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hasPhone: true })
      )
    })

    test('calls onChange when hasWebsite checkbox is checked', () => {
      const onChange = jest.fn()
      render(<AdvancedFilterPanel {...defaultProps} onChange={onChange} />)

      const websiteCheckbox = screen.getByTestId('checkbox-has-website')
      fireEvent.click(websiteCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ hasWebsite: true })
      )
    })

    test('calls onChange when verified checkbox is checked', () => {
      const onChange = jest.fn()
      render(<AdvancedFilterPanel {...defaultProps} onChange={onChange} />)

      const verifiedCheckbox = screen.getByTestId('checkbox-verified')
      fireEvent.click(verifiedCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ verified: true })
      )
    })

    test('calls onChange when country is selected', () => {
      const onChange = jest.fn()
      render(<AdvancedFilterPanel {...defaultProps} onChange={onChange} />)

      const countrySelect = screen.getByTestId('select-native')
      fireEvent.change(countrySelect, { target: { value: 'US' } })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ country: 'US' })
      )
    })
  })

  describe('Specialty Tags', () => {
    test('renders specialty tags when industry is selected', () => {
      render(
        <AdvancedFilterPanel
          {...defaultProps}
          filters={filtersWithIndustry}
        />
      )
      expect(screen.getByText('Specialties')).toBeInTheDocument()
      expect(screen.getByText('Outdoor Seating')).toBeInTheDocument()
      expect(screen.getByText('Delivery')).toBeInTheDocument()
    })

    test('does not render specialties when no industry selected', () => {
      render(<AdvancedFilterPanel {...defaultProps} />)
      expect(screen.queryByText('Specialties')).not.toBeInTheDocument()
    })

    test('calls onChange when specialty tag is clicked', () => {
      const onChange = jest.fn()
      render(
        <AdvancedFilterPanel
          {...defaultProps}
          filters={filtersWithIndustry}
          onChange={onChange}
        />
      )

      fireEvent.click(screen.getByText('Delivery'))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          specialties: ['Delivery'],
        })
      )
    })

    test('shows selected count in specialties header', () => {
      const filtersWithSpecialties: FilterState = {
        ...filtersWithIndustry,
        specialties: ['Delivery', 'Takeout'],
      }
      render(
        <AdvancedFilterPanel
          {...defaultProps}
          filters={filtersWithSpecialties}
        />
      )
      expect(screen.getByText('(2 selected)')).toBeInTheDocument()
    })

    test('deselects specialty when clicked again', () => {
      const onChange = jest.fn()
      const filtersWithSpecialties: FilterState = {
        ...filtersWithIndustry,
        specialties: ['Delivery'],
      }
      render(
        <AdvancedFilterPanel
          {...defaultProps}
          filters={filtersWithSpecialties}
          onChange={onChange}
        />
      )

      fireEvent.click(screen.getByText('Delivery'))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          specialties: [],
        })
      )
    })
  })

  describe('Existing Filter Values', () => {
    test('displays existing city value', () => {
      render(
        <AdvancedFilterPanel
          {...defaultProps}
          filters={filtersWithIndustry}
        />
      )
      const cityInput = screen.getByPlaceholderText('e.g. New York') as HTMLInputElement
      expect(cityInput.value).toBe('New York')
    })

    test('displays checked state for hasEmail', () => {
      render(
        <AdvancedFilterPanel
          {...defaultProps}
          filters={filtersWithIndustry}
        />
      )
      const emailCheckbox = screen.getByTestId('checkbox-has-email') as HTMLInputElement
      expect(emailCheckbox.checked).toBe(true)
    })

    test('displays unchecked state for hasPhone when false', () => {
      render(
        <AdvancedFilterPanel
          {...defaultProps}
          filters={filtersWithIndustry}
        />
      )
      const phoneCheckbox = screen.getByTestId('checkbox-has-phone') as HTMLInputElement
      expect(phoneCheckbox.checked).toBe(false)
    })
  })
})
