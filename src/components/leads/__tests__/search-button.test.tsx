import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchButton } from '../search-button'
import type { UsageInfo } from '@/types'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('SearchButton', () => {
  const mockUsage: UsageInfo = {
    usage_count: 10,
    usage_limit: 100,
    remaining: 90,
    reset_at: '2026-03-01T00:00:00Z',
    tier: 'pro',
  }

  const defaultProps = {
    onClick: jest.fn(),
    loading: false,
    disabled: false,
    usage: mockUsage,
    hasFilters: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Default State', () => {
    test('renders search button with "Search" text', () => {
      render(<SearchButton {...defaultProps} />)
      expect(screen.getByText('searchLeads')).toBeInTheDocument()
    })

    test('renders remaining credits badge', () => {
      render(<SearchButton {...defaultProps} />)
      expect(screen.getByText('90/100')).toBeInTheDocument()
    })

    test('calls onClick when clicked', () => {
      const onClick = jest.fn()
      render(<SearchButton {...defaultProps} onClick={onClick} />)

      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State', () => {
    test('shows "Searching..." text when loading', () => {
      render(<SearchButton {...defaultProps} loading={true} />)
      expect(screen.getByText('searching')).toBeInTheDocument()
    })

    test('disables button when loading', () => {
      render(<SearchButton {...defaultProps} loading={true} />)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Disabled State', () => {
    test('disables button when disabled prop is true', () => {
      render(<SearchButton {...defaultProps} disabled={true} />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    test('disables button when no filters selected', () => {
      render(<SearchButton {...defaultProps} hasFilters={false} />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    test('shows "Select filters to search" when no filters', () => {
      render(<SearchButton {...defaultProps} hasFilters={false} />)
      // Title attribute uses selectFilters translation key
      const button = screen.getByRole('button')
      expect(button.getAttribute('title')).toContain('selectFilters')
    })
  })

  describe('Out of Credits', () => {
    const noCreditsUsage: UsageInfo = {
      usage_count: 100,
      usage_limit: 100,
      remaining: 0,
      reset_at: '2026-03-01T00:00:00Z',
      tier: 'free',
    }

    test('shows "No Credits" when remaining is 0', () => {
      render(<SearchButton {...defaultProps} usage={noCreditsUsage} />)
      expect(screen.getByText('noCredits')).toBeInTheDocument()
    })

    test('disables button when out of credits', () => {
      render(<SearchButton {...defaultProps} usage={noCreditsUsage} />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    test('shows upgrade message when out of credits', () => {
      render(<SearchButton {...defaultProps} usage={noCreditsUsage} />)
      expect(screen.getByText(/outOfCredits/)).toBeInTheDocument()
      expect(screen.getByText('upgrade')).toBeInTheDocument()
    })

    test('does not show credits badge when out of credits', () => {
      render(<SearchButton {...defaultProps} usage={noCreditsUsage} />)
      expect(screen.queryByText('0/100')).not.toBeInTheDocument()
    })
  })

  describe('Low Credits', () => {
    const lowCreditsUsage: UsageInfo = {
      usage_count: 95,
      usage_limit: 100,
      remaining: 5,
      reset_at: '2026-03-01T00:00:00Z',
      tier: 'starter',
    }

    test('shows low credits warning', () => {
      render(<SearchButton {...defaultProps} usage={lowCreditsUsage} />)
      expect(screen.getByText(/lowCredits/)).toBeInTheDocument()
    })

    test('still shows credits badge with remaining count', () => {
      render(<SearchButton {...defaultProps} usage={lowCreditsUsage} />)
      expect(screen.getByText('5/100')).toBeInTheDocument()
    })

    test('button is still enabled with low credits', () => {
      render(<SearchButton {...defaultProps} usage={lowCreditsUsage} />)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })

  describe('Null Usage', () => {
    test('renders without credits display when usage is null', () => {
      render(<SearchButton {...defaultProps} usage={null} />)
      expect(screen.getByText('searchLeads')).toBeInTheDocument()
    })

    test('button is enabled when usage is null and has filters', () => {
      render(<SearchButton {...defaultProps} usage={null} />)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })
})
