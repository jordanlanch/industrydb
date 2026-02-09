import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptySearchState } from '../empty-search-state'
import type { UsageInfo } from '@/types'

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
      expect(screen.getByText('Search for Business Leads')).toBeInTheDocument()
    })

    test('renders instruction text', () => {
      render(<EmptySearchState usage={null} />)
      expect(
        screen.getByText(/Apply filters and click/)
      ).toBeInTheDocument()
    })

    test('renders "How it works" section', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.getByText('How it works')).toBeInTheDocument()
    })

    test('renders 3 steps in how it works', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.getByText('Select Your Filters')).toBeInTheDocument()
      expect(screen.getByText('Click Search')).toBeInTheDocument()
      expect(screen.getByText('Browse & Export')).toBeInTheDocument()
    })

    test('renders key points cards', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.getByText('1 Search = 1 Credit')).toBeInTheDocument()
      expect(screen.getByText('Pagination is Free')).toBeInTheDocument()
      expect(screen.getByText('Verified Data')).toBeInTheDocument()
    })
  })

  describe('Usage Info Display', () => {
    test('displays usage info when provided', () => {
      render(<EmptySearchState usage={mockUsage} />)
      expect(screen.getByText('Searches Remaining')).toBeInTheDocument()
      expect(screen.getByText(/90 of 100 left/)).toBeInTheDocument()
    })

    test('does not display usage info when null', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.queryByText('Searches Remaining')).not.toBeInTheDocument()
    })

    test('shows available searches text for normal usage', () => {
      render(<EmptySearchState usage={mockUsage} />)
      expect(screen.getByText('90 searches available')).toBeInTheDocument()
    })

    test('shows low credits warning when remaining <= 10', () => {
      const lowUsage: UsageInfo = {
        ...mockUsage,
        remaining: 5,
        usage_count: 95,
      }
      render(<EmptySearchState usage={lowUsage} />)
      expect(screen.getByText(/Running low/)).toBeInTheDocument()
    })

    test('shows no searches text when remaining is 0', () => {
      const emptyUsage: UsageInfo = {
        ...mockUsage,
        remaining: 0,
        usage_count: 100,
      }
      render(<EmptySearchState usage={emptyUsage} />)
      expect(screen.getByText('No searches left this month')).toBeInTheDocument()
    })

    test('displays reset date when available', () => {
      render(<EmptySearchState usage={mockUsage} />)
      expect(screen.getByText(/Resets/)).toBeInTheDocument()
    })
  })

  describe('Quick Search Examples', () => {
    test('renders quick search examples when onQuickSearch provided', () => {
      const onQuickSearch = jest.fn()
      render(<EmptySearchState usage={null} onQuickSearch={onQuickSearch} />)

      expect(screen.getByText('Quick Start Examples')).toBeInTheDocument()
      expect(screen.getByText(/Tattoo Studios in USA/)).toBeInTheDocument()
      expect(screen.getByText(/Beauty Salons in UK/)).toBeInTheDocument()
      expect(screen.getByText(/Gyms in Spain/)).toBeInTheDocument()
      expect(screen.getByText(/Restaurants in Germany/)).toBeInTheDocument()
    })

    test('does not render quick search when onQuickSearch is not provided', () => {
      render(<EmptySearchState usage={null} />)
      expect(screen.queryByText('Quick Start Examples')).not.toBeInTheDocument()
    })

    test('calls onQuickSearch with correct params when example clicked', () => {
      const onQuickSearch = jest.fn()
      render(<EmptySearchState usage={null} onQuickSearch={onQuickSearch} />)

      fireEvent.click(screen.getByText(/Tattoo Studios in USA/))
      expect(onQuickSearch).toHaveBeenCalledWith('tattoo', 'US')
    })

    test('calls onQuickSearch for each example correctly', () => {
      const onQuickSearch = jest.fn()
      render(<EmptySearchState usage={null} onQuickSearch={onQuickSearch} />)

      fireEvent.click(screen.getByText(/Beauty Salons in UK/))
      expect(onQuickSearch).toHaveBeenCalledWith('beauty', 'GB')

      fireEvent.click(screen.getByText(/Gyms in Spain/))
      expect(onQuickSearch).toHaveBeenCalledWith('gym', 'ES')

      fireEvent.click(screen.getByText(/Restaurants in Germany/))
      expect(onQuickSearch).toHaveBeenCalledWith('restaurant', 'DE')
    })
  })
})
