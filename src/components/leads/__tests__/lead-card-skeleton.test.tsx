import React from 'react'
import { render } from '@testing-library/react'
import { LeadCardSkeleton, LeadCardSkeletonList } from '../lead-card-skeleton'

describe('LeadCardSkeleton', () => {
  test('renders skeleton container', () => {
    const { container } = render(<LeadCardSkeleton />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse')
  })

  test('renders with border and rounded styling', () => {
    const { container } = render(<LeadCardSkeleton />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('border')
    expect(skeleton).toHaveClass('rounded-lg')
  })

  test('renders shimmer elements for skeleton placeholders', () => {
    const { container } = render(<LeadCardSkeleton />)
    const shimmerElements = container.querySelectorAll('.shimmer')
    expect(shimmerElements.length).toBeGreaterThan(0)
  })

  test('renders title skeleton placeholder', () => {
    const { container } = render(<LeadCardSkeleton />)
    // Title placeholder should be a wide element
    const titleEl = container.querySelector('.h-6.w-48')
    expect(titleEl).toBeInTheDocument()
  })

  test('renders quality score skeleton placeholder', () => {
    const { container } = render(<LeadCardSkeleton />)
    // Quality score placeholder (large number)
    const scoreEl = container.querySelector('.h-8')
    expect(scoreEl).toBeInTheDocument()
  })

  test('renders detail grid skeleton placeholders', () => {
    const { container } = render(<LeadCardSkeleton />)
    const gridElements = container.querySelectorAll('.grid .shimmer')
    expect(gridElements.length).toBe(4)
  })
})

describe('LeadCardSkeletonList', () => {
  test('renders default 3 skeletons', () => {
    const { container } = render(<LeadCardSkeletonList />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(3)
  })

  test('renders custom count of skeletons', () => {
    const { container } = render(<LeadCardSkeletonList count={5} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(5)
  })

  test('renders 1 skeleton when count is 1', () => {
    const { container } = render(<LeadCardSkeletonList count={1} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(1)
  })

  test('renders container with spacing', () => {
    const { container } = render(<LeadCardSkeletonList />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('space-y-4')
  })
})
