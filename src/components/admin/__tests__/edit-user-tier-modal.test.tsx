import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditUserTierModal } from '../edit-user-tier-modal';
import type { User } from '@/services/admin.service';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CreditCard: (props: any) => <svg data-testid="icon-credit-card" {...props} />,
  Shield: (props: any) => <svg data-testid="icon-shield" {...props} />,
  TrendingUp: (props: any) => <svg data-testid="icon-trending-up" {...props} />,
  Loader2: (props: any) => <svg data-testid="icon-loader" {...props} />,
  ChevronDown: (props: any) => <svg data-testid="icon-chevron-down" {...props} />,
}));

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

// Use real Select component (already custom, not Radix)

describe('EditUserTierModal', () => {
  const mockUser: User = {
    id: 42,
    name: 'Jane Smith',
    email: 'jane@example.com',
    tier: 'pro',
    role: 'user',
    usage_count: 500,
    usage_limit: 2000,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  };

  const mockOnOpenChange = jest.fn();
  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  const defaultProps = {
    user: mockUser,
    open: true,
    onOpenChange: mockOnOpenChange,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders modal title', () => {
      render(<EditUserTierModal {...defaultProps} />);

      expect(screen.getByText('Edit User Details')).toBeInTheDocument();
    });

    test('renders user name in description', () => {
      render(<EditUserTierModal {...defaultProps} />);

      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
    });

    test('renders tier selection section', () => {
      render(<EditUserTierModal {...defaultProps} />);

      expect(screen.getByText('Subscription Tier')).toBeInTheDocument();
    });

    test('renders role selection section', () => {
      render(<EditUserTierModal {...defaultProps} />);

      expect(screen.getByText('User Role')).toBeInTheDocument();
    });

    test('renders usage limit section', () => {
      render(<EditUserTierModal {...defaultProps} />);

      expect(screen.getByText('Custom Usage Limit')).toBeInTheDocument();
    });

    test('renders summary of changes section', () => {
      render(<EditUserTierModal {...defaultProps} />);

      expect(screen.getByText('Summary of Changes:')).toBeInTheDocument();
    });

    test('shows "No changes to save" when nothing changed', () => {
      render(<EditUserTierModal {...defaultProps} />);

      expect(screen.getByText('No changes to save')).toBeInTheDocument();
    });
  });

  describe('Tier Selection', () => {
    test('renders tier dropdown with current tier selected', () => {
      render(<EditUserTierModal {...defaultProps} />);

      // The Select component shows the value as text
      expect(screen.getByText('pro')).toBeInTheDocument();
    });

    test('shows all tier options when dropdown is opened', () => {
      render(<EditUserTierModal {...defaultProps} />);

      // Click the tier trigger to open dropdown
      const tierTrigger = screen.getByText('pro').closest('button');
      if (tierTrigger) fireEvent.click(tierTrigger);

      expect(screen.getByText(/Free/)).toBeInTheDocument();
      expect(screen.getByText(/Starter/)).toBeInTheDocument();
      expect(screen.getByText(/Pro/)).toBeInTheDocument();
      expect(screen.getByText(/Business/)).toBeInTheDocument();
    });

    test('changing tier updates usage limit automatically', () => {
      render(<EditUserTierModal {...defaultProps} />);

      // Open tier dropdown
      const tierTrigger = screen.getByText('pro').closest('button');
      if (tierTrigger) fireEvent.click(tierTrigger);

      // Select "business" tier
      fireEvent.click(screen.getByText(/Business/));

      // Usage limit input should update to 10000
      const usageLimitInput = screen.getByDisplayValue('10000');
      expect(usageLimitInput).toBeInTheDocument();
    });

    test('shows tier change in summary', () => {
      render(<EditUserTierModal {...defaultProps} />);

      // Open tier dropdown and change
      const tierTrigger = screen.getByText('pro').closest('button');
      if (tierTrigger) fireEvent.click(tierTrigger);
      fireEvent.click(screen.getByText(/Business/));

      expect(screen.getByText(/Tier: pro → business/)).toBeInTheDocument();
    });
  });

  describe('Usage Limit', () => {
    test('renders usage limit input with current value', () => {
      render(<EditUserTierModal {...defaultProps} />);

      const input = screen.getByDisplayValue('2000');
      expect(input).toBeInTheDocument();
    });

    test('allows custom usage limit input', () => {
      render(<EditUserTierModal {...defaultProps} />);

      const input = screen.getByDisplayValue('2000');
      fireEvent.change(input, { target: { value: '5000' } });

      expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    });

    test('shows usage limit change in summary', () => {
      render(<EditUserTierModal {...defaultProps} />);

      const input = screen.getByDisplayValue('2000');
      fireEvent.change(input, { target: { value: '5000' } });

      expect(screen.getByText(/Usage Limit: 2,000 → 5,000/)).toBeInTheDocument();
    });
  });

  describe('Role Selection', () => {
    test('renders role dropdown with current role', () => {
      render(<EditUserTierModal {...defaultProps} />);

      expect(screen.getByText('user')).toBeInTheDocument();
    });

    test('shows all role options', () => {
      render(<EditUserTierModal {...defaultProps} />);

      // Find the role trigger (the second select)
      const buttons = screen.getAllByRole('button');
      const roleTrigger = buttons.find((btn) =>
        btn.textContent?.includes('user') && !btn.textContent?.includes('Edit')
      );
      if (roleTrigger) fireEvent.click(roleTrigger);

      expect(screen.getByText(/Standard access/)).toBeInTheDocument();
      expect(screen.getByText(/Can manage users/)).toBeInTheDocument();
      expect(screen.getByText(/Full access/)).toBeInTheDocument();
    });

    test('shows role change in summary', () => {
      render(<EditUserTierModal {...defaultProps} />);

      // Open role dropdown
      const buttons = screen.getAllByRole('button');
      const roleTrigger = buttons.find((btn) =>
        btn.textContent?.includes('user') && !btn.textContent?.includes('Edit')
      );
      if (roleTrigger) fireEvent.click(roleTrigger);

      // Select admin
      fireEvent.click(screen.getByText(/Can manage users/));

      expect(screen.getByText(/Role: user → admin/)).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    test('calls onSave with changed fields when Save is clicked', async () => {
      render(<EditUserTierModal {...defaultProps} />);

      // Change usage limit
      const input = screen.getByDisplayValue('2000');
      fireEvent.change(input, { target: { value: '5000' } });

      // Click save
      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(42, { usage_limit: 5000 });
      });
    });

    test('closes modal after successful save', async () => {
      render(<EditUserTierModal {...defaultProps} />);

      const input = screen.getByDisplayValue('2000');
      fireEvent.change(input, { target: { value: '5000' } });

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    test('shows loading state while saving', async () => {
      mockOnSave.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EditUserTierModal {...defaultProps} />);

      const input = screen.getByDisplayValue('2000');
      fireEvent.change(input, { target: { value: '5000' } });

      fireEvent.click(screen.getByText('Save Changes'));

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      });
    });

    test('Save button is disabled when no changes made', () => {
      render(<EditUserTierModal {...defaultProps} />);

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });

    test('Save button is enabled when changes are made', () => {
      render(<EditUserTierModal {...defaultProps} />);

      const input = screen.getByDisplayValue('2000');
      fireEvent.change(input, { target: { value: '5000' } });

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).not.toBeDisabled();
    });

    test('only sends changed fields to onSave', async () => {
      render(<EditUserTierModal {...defaultProps} />);

      // Only change usage limit, not tier or role
      const input = screen.getByDisplayValue('2000');
      fireEvent.change(input, { target: { value: '3000' } });

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(42, { usage_limit: 3000 });
      });
    });

    test('handles save error gracefully', async () => {
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(<EditUserTierModal {...defaultProps} />);

      const input = screen.getByDisplayValue('2000');
      fireEvent.change(input, { target: { value: '5000' } });

      fireEvent.click(screen.getByText('Save Changes'));

      // Should not close modal on error
      await waitFor(() => {
        expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Cancel Functionality', () => {
    test('renders Cancel button', () => {
      render(<EditUserTierModal {...defaultProps} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('closes modal when Cancel is clicked', () => {
      render(<EditUserTierModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test('Cancel button is disabled while saving', async () => {
      mockOnSave.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 200))
      );

      render(<EditUserTierModal {...defaultProps} />);

      const input = screen.getByDisplayValue('2000');
      fireEvent.change(input, { target: { value: '5000' } });

      fireEvent.click(screen.getByText('Save Changes'));

      expect(screen.getByText('Cancel')).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Cancel')).not.toBeDisabled();
      });
    });
  });

  describe('Null User', () => {
    test('returns null when user is null', () => {
      const { container } = render(
        <EditUserTierModal {...defaultProps} user={null} />
      );

      expect(container.innerHTML).toBe('');
    });
  });

  describe('Closed State', () => {
    test('does not render when open is false', () => {
      render(<EditUserTierModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Edit User Details')).not.toBeInTheDocument();
    });
  });
});
