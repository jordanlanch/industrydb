import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeadViewToggle, type ViewMode } from '../lead-view-toggle'

describe('LeadViewToggle', () => {
  const defaultProps = {
    mode: 'card' as ViewMode,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders Cards and Table buttons', () => {
      render(<LeadViewToggle {...defaultProps} />)
      expect(screen.getByText('Cards')).toBeInTheDocument()
      expect(screen.getByText('Table')).toBeInTheDocument()
    })

    test('renders with card mode active', () => {
      render(<LeadViewToggle {...defaultProps} mode="card" />)
      const cardsButton = screen.getByText('Cards').closest('button')
      expect(cardsButton).toHaveClass('bg-primary')
    })

    test('renders with table mode active', () => {
      render(<LeadViewToggle {...defaultProps} mode="table" />)
      const tableButton = screen.getByText('Table').closest('button')
      expect(tableButton).toHaveClass('bg-primary')
    })

    test('applies custom className', () => {
      const { container } = render(
        <LeadViewToggle {...defaultProps} className="custom-toggle" />
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-toggle')
    })
  })

  describe('Interaction', () => {
    test('calls onChange with "card" when Cards button is clicked', () => {
      const onChange = jest.fn()
      render(<LeadViewToggle mode="table" onChange={onChange} />)

      fireEvent.click(screen.getByText('Cards'))
      expect(onChange).toHaveBeenCalledWith('card')
    })

    test('calls onChange with "table" when Table button is clicked', () => {
      const onChange = jest.fn()
      render(<LeadViewToggle mode="card" onChange={onChange} />)

      fireEvent.click(screen.getByText('Table'))
      expect(onChange).toHaveBeenCalledWith('table')
    })

    test('calls onChange even when clicking already active mode', () => {
      const onChange = jest.fn()
      render(<LeadViewToggle mode="card" onChange={onChange} />)

      fireEvent.click(screen.getByText('Cards'))
      expect(onChange).toHaveBeenCalledWith('card')
    })
  })

  describe('Visual State', () => {
    test('inactive button does not have bg-primary class', () => {
      render(<LeadViewToggle {...defaultProps} mode="card" />)
      const tableButton = screen.getByText('Table').closest('button')
      expect(tableButton).not.toHaveClass('bg-primary')
    })

    test('both buttons are rendered as button elements', () => {
      render(<LeadViewToggle {...defaultProps} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })
  })
})
