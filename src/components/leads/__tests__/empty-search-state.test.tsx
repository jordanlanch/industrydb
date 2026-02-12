import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptySearchState } from '../empty-search-state'
import type { UsageInfo } from '@/types'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

describe('EmptySearchState', () => {
  const mockUsage: UsageInfo = {
    usage_count: 10,
    usage_limit: 100,
    remaining: 90,
    reset_at: '2026-03-01T00:00:00Z',
    tier: 'pro',
  }

  describe('Rendering', () => {
    test('renders search title', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.getByText('title')).toBeInTheDocument()
    })

    test('renders instruction text', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.getByText('subtitle')).toBeInTheDocument()
    })

    test('renders "How it works" section', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.getByText('howItWorks')).toBeInTheDocument()
    })

    test('renders 3 steps in how it works', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.getByText('step1Title')).toBeInTheDocument()
      expect(screen.getByText('step2Title')).toBeInTheDocument()
      expect(screen.getByText('step3Title')).toBeInTheDocument()
    })

    test('does not render key points cards (removed for mobile)', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.queryByText('oneCredit')).not.toBeInTheDocument()
      expect(screen.queryByText('paginationFree')).not.toBeInTheDocument()
      expect(screen.queryByText('verifiedData')).not.toBeInTheDocument()
    })
  })

  describe('Usage Info Display', () => {
    test('displays usage info when provided', () => {
      render(<EmptySearchState usage={mockUsage} />)
      expect(screen.getByText('searchesRemaining')).toBeInTheDocument()
      expect(screen.getByText(/remainingOf/)).toBeInTheDocument()
    })

    test('does not display usage info when null', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.queryByText('searchesRemaining')).not.toBeInTheDocument()
    })

    test('shows available searches text for normal usage', () => {
      render(<EmptySearchState usage={mockUsage} />)
      expect(screen.getByText(/searchesAvailable/)).toBeInTheDocument()
    })

    test('shows low credits warning when remaining <= 10', () => {
      const lowUsage: UsageInfo = {
        ...mockUsage,
        remaining: 5,
        usage_count: 95,
      }
      render(<EmptySearchState usage={lowUsage} />)
      expect(screen.getByText(/runningLow/)).toBeInTheDocument()
    })

    test('shows no searches text when remaining is 0', () => {
      const emptyUsage: UsageInfo = {
        ...mockUsage,
        remaining: 0,
        usage_count: 100,
      }
      render(<EmptySearchState usage={emptyUsage} />)
      expect(screen.getByText('noSearchesLeft')).toBeInTheDocument()
    })

    test('displays reset date when available', () => {
      render(<EmptySearchState usage={mockUsage} />)
      expect(screen.getByText(/resetsOn/)).toBeInTheDocument()
    })
  })

  describe('Quick Search Examples', () => {
    test('renders quick search examples when onQuickSearch provided', () => {
      const onQuickSearch = jest.fn()
      render(<EmptySearchState usage={null} onQuickSearch={onQuickSearch} />)

      expect(screen.getByText('quickStart')).toBeInTheDocument()
      expect(screen.getByText(/tattooUSA/)).toBeInTheDocument()
      expect(screen.getByText(/beautyUK/)).toBeInTheDocument()
      expect(screen.getByText(/gymsSpain/)).toBeInTheDocument()
      expect(screen.getByText(/restaurantsGermany/)).toBeInTheDocument()
    })

    test('does not render quick search when onQuickSearch is not provided', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.queryByText('quickStart')).not.toBeInTheDocument()
    })

    test('calls onQuickSearch with correct params when example clicked', () => {
      const onQuickSearch = jest.fn()
      render(<EmptySearchState usage={null} onQuickSearch={onQuickSearch} />)

      fireEvent.click(screen.getByText(/tattooUSA/))
      expect(onQuickSearch).toHaveBeenCalledWith('tattoo', 'US')
    })

    test('calls onQuickSearch for each example correctly', () => {
      const onQuickSearch = jest.fn()
      render(<EmptySearchState usage={null} onQuickSearch={onQuickSearch} />)

      fireEvent.click(screen.getByText(/beautyUK/))
      expect(onQuickSearch).toHaveBeenCalledWith('beauty', 'GB')

      fireEvent.click(screen.getByText(/gymsSpain/))
      expect(onQuickSearch).toHaveBeenCalledWith('gym', 'ES')

      fireEvent.click(screen.getByText(/restaurantsGermany/))
      expect(onQuickSearch).toHaveBeenCalledWith('restaurant', 'DE')
    })
  })
})
