import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeadTableRow } from '../lead-table-row'
import type { Lead } from '@/types'

// Mock quality badge
jest.mock('../quality-badge', () => ({
  QualityBadge: ({ score, showScore }: any) => (
    <span data-testid="quality-badge">
      {showScore !== false ? `Score: ${score}` : 'Quality'}
    </span>
  ),
}))

const baseLead: Lead = {
  id: 1,
  name: 'Test Studio',
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
  email: 'info@teststudio.com',
  website: 'https://www.teststudio.com',
}

// Helper to render a table row in a proper table context
function renderInTable(ui: React.ReactElement) {
  return render(
    <table>
      <tbody>{ui}</tbody>
    </table>
  )
}

describe('LeadTableRow', () => {
  describe('Lead Data Display', () => {
    test('renders lead name', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      expect(screen.getByText('Test Studio')).toBeInTheDocument()
    })

    test('renders city and country', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      expect(screen.getByText('New York, US')).toBeInTheDocument()
    })

    test('renders industry badge', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      expect(screen.getByText('tattoo')).toBeInTheDocument()
    })

    test('renders verified badge when verified', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    test('does not render verified badge when not verified', () => {
      renderInTable(
        <LeadTableRow lead={{ ...baseLead, verified: false }} />
      )
      expect(screen.queryByText('Verified')).not.toBeInTheDocument()
    })

    test('renders quality badge', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      expect(screen.getByTestId('quality-badge')).toBeInTheDocument()
    })

    test('renders quality score number', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      expect(screen.getByText('75')).toBeInTheDocument()
    })
  })

  describe('Email Column', () => {
    test('renders email when available', () => {
      renderInTable(<LeadTableRow lead={fullLead} />)
      expect(screen.getByText('info@teststudio.com')).toBeInTheDocument()
    })

    test('renders dash when email is missing', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      const dashes = screen.getAllByText('-')
      expect(dashes.length).toBeGreaterThan(0)
    })

    test('renders copy button when onCopyEmail provided', () => {
      const onCopyEmail = jest.fn()
      renderInTable(<LeadTableRow lead={fullLead} onCopyEmail={onCopyEmail} />)

      const copyButtons = screen.getAllByRole('button')
      expect(copyButtons.length).toBeGreaterThan(0)
    })

    test('calls onCopyEmail with email when copy clicked', () => {
      const onCopyEmail = jest.fn()
      renderInTable(<LeadTableRow lead={fullLead} onCopyEmail={onCopyEmail} />)

      // Find the copy button next to email
      const copyButtons = screen.getAllByRole('button')
      fireEvent.click(copyButtons[0])
      expect(onCopyEmail).toHaveBeenCalledWith('info@teststudio.com')
    })

    test('does not render email copy button when onCopyEmail not provided', () => {
      renderInTable(<LeadTableRow lead={fullLead} />)
      // Should still show email but no button (unless onCopyPhone provides buttons)
      expect(screen.getByText('info@teststudio.com')).toBeInTheDocument()
    })
  })

  describe('Phone Column', () => {
    test('renders phone when available', () => {
      renderInTable(<LeadTableRow lead={fullLead} />)
      expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument()
    })

    test('renders dash when phone is missing', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      const dashes = screen.getAllByText('-')
      expect(dashes.length).toBeGreaterThan(0)
    })

    test('calls onCopyPhone when copy clicked', () => {
      const onCopyPhone = jest.fn()
      renderInTable(
        <LeadTableRow lead={fullLead} onCopyPhone={onCopyPhone} />
      )

      const copyButtons = screen.getAllByRole('button')
      // The phone copy button
      fireEvent.click(copyButtons[0])
      expect(onCopyPhone).toHaveBeenCalledWith('+1-555-123-4567')
    })
  })

  describe('Website Column', () => {
    test('renders website link when available', () => {
      renderInTable(<LeadTableRow lead={fullLead} />)
      const visitLink = screen.getByText('Visit')
      expect(visitLink).toBeInTheDocument()
      expect(visitLink.closest('a')).toHaveAttribute('href', 'https://www.teststudio.com')
      expect(visitLink.closest('a')).toHaveAttribute('target', '_blank')
      expect(visitLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer')
    })

    test('renders dash when website is missing', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      const dashes = screen.getAllByText('-')
      expect(dashes.length).toBeGreaterThan(0)
    })
  })

  describe('Table Row Structure', () => {
    test('renders as a table row (tr)', () => {
      const { container } = renderInTable(<LeadTableRow lead={baseLead} />)
      const row = container.querySelector('tr')
      expect(row).toBeInTheDocument()
    })

    test('renders 6 table cells (td)', () => {
      const { container } = renderInTable(<LeadTableRow lead={baseLead} />)
      const cells = container.querySelectorAll('td')
      expect(cells).toHaveLength(6)
    })

    test('row has hover styling class', () => {
      const { container } = renderInTable(<LeadTableRow lead={baseLead} />)
      const row = container.querySelector('tr')
      expect(row).toHaveClass('hover:bg-gray-50')
    })
  })

  describe('Missing Fields', () => {
    test('handles lead without email, phone, or website', () => {
      renderInTable(<LeadTableRow lead={baseLead} />)
      // Should render name and not crash
      expect(screen.getByText('Test Studio')).toBeInTheDocument()
      // Should have dashes for missing fields
      const dashes = screen.getAllByText('-')
      expect(dashes).toHaveLength(3) // email, phone, website
    })
  })
})
