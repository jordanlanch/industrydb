import React from 'react'
import { render, screen } from '@testing-library/react'
import { QualityBadge } from '../quality-badge'

describe('QualityBadge', () => {
  describe('Rendering', () => {
    test('renders badge element', () => {
      render(<QualityBadge score={75} />)
      expect(screen.getByText(/Good/)).toBeInTheDocument()
    })

    test('displays score when showScore is true (default)', () => {
      render(<QualityBadge score={85} />)
      expect(screen.getByText(/Excellent \(85\)/)).toBeInTheDocument()
    })

    test('hides score when showScore is false', () => {
      render(<QualityBadge score={85} showScore={false} />)
      expect(screen.getByText('Excellent')).toBeInTheDocument()
      expect(screen.queryByText(/85/)).not.toBeInTheDocument()
    })
  })

  describe('Quality Tiers', () => {
    test('renders "Excellent" for score >= 80', () => {
      render(<QualityBadge score={80} />)
      expect(screen.getByText(/Excellent/)).toBeInTheDocument()
    })

    test('renders "Excellent" for score 100', () => {
      render(<QualityBadge score={100} />)
      expect(screen.getByText(/Excellent/)).toBeInTheDocument()
    })

    test('renders "Good" for score >= 60 and < 80', () => {
      render(<QualityBadge score={65} />)
      expect(screen.getByText(/Good/)).toBeInTheDocument()
    })

    test('renders "Fair" for score >= 40 and < 60', () => {
      render(<QualityBadge score={45} />)
      expect(screen.getByText(/Fair/)).toBeInTheDocument()
    })

    test('renders "Poor" for score < 40', () => {
      render(<QualityBadge score={20} />)
      expect(screen.getByText(/Poor/)).toBeInTheDocument()
    })

    test('renders "Poor" for score 0', () => {
      render(<QualityBadge score={0} />)
      expect(screen.getByText(/Poor/)).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    test('applies custom className', () => {
      const { container } = render(<QualityBadge score={75} className="custom-class" />)
      const badge = container.querySelector('.custom-class')
      expect(badge).toBeInTheDocument()
    })

    test('applies bg-green-500 for excellent tier', () => {
      const { container } = render(<QualityBadge score={85} />)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-green-500')
    })

    test('applies bg-blue-500 for good tier', () => {
      const { container } = render(<QualityBadge score={65} />)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-blue-500')
    })

    test('applies bg-yellow-500 for fair tier', () => {
      const { container } = render(<QualityBadge score={45} />)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-yellow-500')
    })

    test('applies bg-red-500 for poor tier', () => {
      const { container } = render(<QualityBadge score={15} />)
      const badge = container.firstChild
      expect(badge).toHaveClass('bg-red-500')
    })

    test('always has text-white and font-semibold classes', () => {
      const { container } = render(<QualityBadge score={50} />)
      const badge = container.firstChild
      expect(badge).toHaveClass('text-white')
      expect(badge).toHaveClass('font-semibold')
    })
  })

  describe('Edge Cases', () => {
    test('handles boundary score 80 as excellent', () => {
      render(<QualityBadge score={80} />)
      expect(screen.getByText(/Excellent/)).toBeInTheDocument()
    })

    test('handles boundary score 60 as good', () => {
      render(<QualityBadge score={60} />)
      expect(screen.getByText(/Good/)).toBeInTheDocument()
    })

    test('handles boundary score 40 as fair', () => {
      render(<QualityBadge score={40} />)
      expect(screen.getByText(/Fair/)).toBeInTheDocument()
    })

    test('handles boundary score 39 as poor', () => {
      render(<QualityBadge score={39} />)
      expect(screen.getByText(/Poor/)).toBeInTheDocument()
    })
  })
})
