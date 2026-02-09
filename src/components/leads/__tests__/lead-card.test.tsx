import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeadCard, LeadGroupHeader } from '../lead-card'
import type { Lead } from '@/types'

// Mock child components to isolate LeadCard tests
jest.mock('../sub-niche-badge', () => ({
  SubNicheBadge: ({ subNicheName, industryName }: any) => (
    <span data-testid="sub-niche-badge">{subNicheName || industryName}</span>
  ),
  SubNicheBadgeCompact: ({ subNicheName }: any) => (
    <span data-testid="sub-niche-badge-compact">{subNicheName}</span>
  ),
}))

jest.mock('../quality-badge', () => ({
  QualityBadge: ({ score }: any) => (
    <span data-testid="quality-badge">Quality: {score}</span>
  ),
}))

jest.mock('../quality-progress-bar', () => ({
  QualityProgressBar: ({ score }: any) => (
    <div data-testid="quality-progress-bar">Progress: {score}</div>
  ),
}))

jest.mock('../field-presence-icons', () => ({
  FieldPresenceIcons: () => <div data-testid="field-presence-icons" />,
}))

jest.mock('../completeness-indicator', () => ({
  CompletenessIndicator: () => <div data-testid="completeness-indicator" />,
}))

const baseLead: Lead = {
  id: 1,
  name: 'Test Tattoo Studio',
  industry: 'tattoo',
  country: 'US',
  city: 'New York',
  verified: true,
  quality_score: 75,
  created_at: '2026-01-15T10:00:00Z',
}

const fullLead: Lead = {
  ...baseLead,
  phone: '+1-555-123-4567',
  email: 'contact@teststudio.com',
  website: 'https://www.teststudio.com',
  address: '123 Main St',
  sub_niche: 'traditional',
  specialties: ['Custom Designs', 'Cover-ups', 'Portraits'],
}

describe('LeadCard', () => {
  describe('Default Variant', () => {
    test('renders lead name', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.getByText('Test Tattoo Studio')).toBeInTheDocument()
    })

    test('renders industry badge when no sub-niche', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.getByText('tattoo')).toBeInTheDocument()
    })

    test('renders verified badge when lead is verified', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    test('does not render verified badge when not verified', () => {
      render(<LeadCard lead={{ ...baseLead, verified: false }} />)
      expect(screen.queryByText('Verified')).not.toBeInTheDocument()
    })

    test('renders quality badge', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.getByTestId('quality-badge')).toBeInTheDocument()
    })

    test('renders quality score number', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.getByText('75')).toBeInTheDocument()
    })

    test('renders city and country location', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.getByText('New York, US')).toBeInTheDocument()
    })

    test('renders quality progress bar', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.getByTestId('quality-progress-bar')).toBeInTheDocument()
    })

    test('renders field presence icons', () => {
      render(<LeadCard lead={baseLead} />)
      const icons = screen.getAllByTestId('field-presence-icons')
      expect(icons.length).toBeGreaterThan(0)
    })

    test('renders completeness indicator', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.getByTestId('completeness-indicator')).toBeInTheDocument()
    })
  })

  describe('Contact Information', () => {
    test('renders email when available', () => {
      render(<LeadCard lead={fullLead} />)
      expect(screen.getByText('contact@teststudio.com')).toBeInTheDocument()
    })

    test('renders phone when available', () => {
      render(<LeadCard lead={fullLead} />)
      expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument()
    })

    test('renders website link when available', () => {
      render(<LeadCard lead={fullLead} />)
      const websiteLink = screen.getByText('www.teststudio.com')
      expect(websiteLink).toBeInTheDocument()
      expect(websiteLink.closest('a')).toHaveAttribute('href', 'https://www.teststudio.com')
      expect(websiteLink.closest('a')).toHaveAttribute('target', '_blank')
    })

    test('does not render email section when missing', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.queryByText('contact@teststudio.com')).not.toBeInTheDocument()
    })

    test('does not render phone section when missing', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.queryByText('+1-555-123-4567')).not.toBeInTheDocument()
    })

    test('does not render website section when missing', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.queryByText(/teststudio\.com/)).not.toBeInTheDocument()
    })
  })

  describe('Sub-niche Display', () => {
    test('renders sub-niche badge when sub_niche exists', () => {
      render(<LeadCard lead={fullLead} />)
      expect(screen.getAllByTestId('sub-niche-badge').length).toBeGreaterThan(0)
    })

    test('prioritizes cuisine_type over sub_niche', () => {
      const restaurantLead: Lead = {
        ...baseLead,
        industry: 'restaurant',
        cuisine_type: 'italian',
        sub_niche: 'generic',
      }
      render(<LeadCard lead={restaurantLead} />)
      const badges = screen.getAllByTestId('sub-niche-badge')
      expect(badges[0]).toHaveTextContent('Italian')
    })

    test('prioritizes sport_type for gym industry', () => {
      const gymLead: Lead = {
        ...baseLead,
        industry: 'gym',
        sport_type: 'crossfit',
      }
      render(<LeadCard lead={gymLead} />)
      const badges = screen.getAllByTestId('sub-niche-badge')
      expect(badges[0]).toHaveTextContent('Crossfit')
    })

    test('prioritizes tattoo_style for tattoo industry', () => {
      const tattooLead: Lead = {
        ...baseLead,
        industry: 'tattoo',
        tattoo_style: 'japanese',
      }
      render(<LeadCard lead={tattooLead} />)
      const badges = screen.getAllByTestId('sub-niche-badge')
      expect(badges[0]).toHaveTextContent('Japanese')
    })
  })

  describe('Specialties', () => {
    test('renders specialty tags when available', () => {
      render(<LeadCard lead={fullLead} />)
      const badges = screen.getAllByTestId('sub-niche-badge-compact')
      expect(badges.length).toBeGreaterThan(0)
    })

    test('shows "+N more" for specialties exceeding 5', () => {
      const manySpecialties: Lead = {
        ...baseLead,
        specialties: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      }
      render(<LeadCard lead={manySpecialties} />)
      expect(screen.getByText('+2 more')).toBeInTheDocument()
    })

    test('does not render specialties section when empty', () => {
      render(<LeadCard lead={baseLead} />)
      expect(screen.queryByTestId('sub-niche-badge-compact')).not.toBeInTheDocument()
    })
  })

  describe('Copy Functionality', () => {
    test('calls onCopyText when copy email button clicked', () => {
      const onCopyText = jest.fn()
      render(<LeadCard lead={fullLead} onCopyText={onCopyText} />)

      const copyButtons = screen.getAllByTitle(/Copy/)
      const emailCopyButton = copyButtons.find(btn => btn.title === 'Copy email')
      fireEvent.click(emailCopyButton!)
      expect(onCopyText).toHaveBeenCalledWith('contact@teststudio.com', 'Email')
    })

    test('calls onCopyText when copy phone button clicked', () => {
      const onCopyText = jest.fn()
      render(<LeadCard lead={fullLead} onCopyText={onCopyText} />)

      const phoneCopyButton = screen.getByTitle('Copy phone number')
      fireEvent.click(phoneCopyButton)
      expect(onCopyText).toHaveBeenCalledWith('+1-555-123-4567', 'Phone')
    })

    test('falls back to navigator.clipboard when onCopyText not provided', () => {
      const mockWriteText = jest.fn()
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText },
      })

      render(<LeadCard lead={fullLead} />)

      const emailCopyButton = screen.getByTitle('Copy email')
      fireEvent.click(emailCopyButton)
      expect(mockWriteText).toHaveBeenCalledWith('contact@teststudio.com')
    })
  })

  describe('Compact Variant', () => {
    test('renders in compact mode', () => {
      render(<LeadCard lead={baseLead} variant="compact" />)
      expect(screen.getByText('Test Tattoo Studio')).toBeInTheDocument()
    })

    test('renders quality score number in compact mode', () => {
      render(<LeadCard lead={baseLead} variant="compact" />)
      expect(screen.getByText('75')).toBeInTheDocument()
    })

    test('renders location in compact mode', () => {
      render(<LeadCard lead={baseLead} variant="compact" />)
      expect(screen.getByText('New York, US')).toBeInTheDocument()
    })

    test('renders verified badge in compact mode', () => {
      render(<LeadCard lead={baseLead} variant="compact" />)
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    test('applies custom className to container', () => {
      const { container } = render(
        <LeadCard lead={baseLead} className="my-custom-class" />
      )
      expect(container.firstChild).toHaveClass('my-custom-class')
    })
  })

  describe('Missing Optional Fields', () => {
    test('handles lead without city gracefully', () => {
      const noCityLead: Lead = {
        ...baseLead,
        city: '',
      }
      render(<LeadCard lead={noCityLead} />)
      expect(screen.getByText('Test Tattoo Studio')).toBeInTheDocument()
      // City section should not render since city is falsy
      expect(screen.queryByText(', US')).not.toBeInTheDocument()
    })

    test('handles lead with minimal data', () => {
      const minimalLead: Lead = {
        id: 2,
        name: 'Minimal Lead',
        industry: 'beauty',
        country: 'GB',
        city: '',
        verified: false,
        quality_score: 10,
        created_at: '2026-01-01T00:00:00Z',
      }
      render(<LeadCard lead={minimalLead} />)
      expect(screen.getByText('Minimal Lead')).toBeInTheDocument()
      expect(screen.getByText('beauty')).toBeInTheDocument()
    })
  })
})

describe('LeadGroupHeader', () => {
  test('renders title', () => {
    render(<LeadGroupHeader title="Tattoo Studios" count={25} />)
    expect(screen.getByText('Tattoo Studios')).toBeInTheDocument()
  })

  test('renders count badge', () => {
    render(<LeadGroupHeader title="Tattoo Studios" count={25} />)
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  test('renders icon when provided', () => {
    render(
      <LeadGroupHeader
        title="Test"
        count={5}
        icon={<span data-testid="group-icon">🎨</span>}
      />
    )
    expect(screen.getByTestId('group-icon')).toBeInTheDocument()
  })

  test('renders without icon', () => {
    render(<LeadGroupHeader title="Test" count={5} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
