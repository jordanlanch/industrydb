import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserDetailsModal } from '../user-details-modal';
import type { User } from '@/services/admin.service';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Mail: (props: any) => <svg data-testid="icon-mail" {...props} />,
  Calendar: (props: any) => <svg data-testid="icon-calendar" {...props} />,
  CheckCircle: (props: any) => <svg data-testid="icon-check-circle" {...props} />,
  XCircle: (props: any) => <svg data-testid="icon-x-circle" {...props} />,
  Shield: (props: any) => <svg data-testid="icon-shield" {...props} />,
  CreditCard: (props: any) => <svg data-testid="icon-credit-card" {...props} />,
  TrendingUp: (props: any) => <svg data-testid="icon-trending-up" {...props} />,
  Edit2: (props: any) => <svg data-testid="icon-edit2" {...props} />,
  Ban: (props: any) => <svg data-testid="icon-ban" {...props} />,
  X: (props: any) => <svg data-testid="icon-x" {...props} />,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`;
  },
}));

// Mock Radix Dialog - render children directly when open
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, disabled, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

describe('UserDetailsModal', () => {
  const mockUser: User = {
    id: 42,
    name: 'Jane Smith',
    email: 'jane@example.com',
    tier: 'pro',
    role: 'user',
    usage_count: 1500,
    usage_limit: 2000,
    email_verified_at: '2026-01-15T10:00:00Z',
    stripe_customer_id: 'cus_abc123',
    last_login_at: '2026-02-01T14:30:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-01T12:00:00Z',
  };

  const mockOnOpenChange = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnSuspend = jest.fn();

  const defaultProps = {
    user: mockUser,
    open: true,
    onOpenChange: mockOnOpenChange,
    onEdit: mockOnEdit,
    onSuspend: mockOnSuspend,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders user name and email', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    test('renders user ID', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('User ID: 42')).toBeInTheDocument();
    });

    test('renders user avatar with initial', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    test('renders subscription tier badge', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('Pro')).toBeInTheDocument();
    });

    test('renders role badge', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('User')).toBeInTheDocument();
    });

    test('renders different tier badge colors', () => {
      const tiers = [
        { tier: 'free', expected: 'bg-gray-100' },
        { tier: 'starter', expected: 'bg-blue-100' },
        { tier: 'pro', expected: 'bg-purple-100' },
        { tier: 'business', expected: 'bg-green-100' },
      ];

      for (const { tier, expected } of tiers) {
        const { unmount } = render(
          <UserDetailsModal {...defaultProps} user={{ ...mockUser, tier }} />
        );
        const badges = screen.getAllByTestId('badge');
        const tierBadge = badges[0];
        expect(tierBadge.className).toContain(expected);
        unmount();
      }
    });

    test('renders admin role badge with orange color', () => {
      render(
        <UserDetailsModal {...defaultProps} user={{ ...mockUser, role: 'admin' }} />
      );

      const badges = screen.getAllByTestId('badge');
      const roleBadge = badges[1];
      expect(roleBadge.className).toContain('bg-orange-100');
    });

    test('renders superadmin role badge with red color', () => {
      render(
        <UserDetailsModal {...defaultProps} user={{ ...mockUser, role: 'superadmin' }} />
      );

      const badges = screen.getAllByTestId('badge');
      const roleBadge = badges[1];
      expect(roleBadge.className).toContain('bg-red-100');
    });
  });

  describe('Email Verification Status', () => {
    test('shows verified status when email is verified', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText(/Verified on/)).toBeInTheDocument();
      expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
    });

    test('shows not verified status when email is not verified', () => {
      render(
        <UserDetailsModal
          {...defaultProps}
          user={{ ...mockUser, email_verified_at: undefined }}
        />
      );

      expect(screen.getByText('Not verified')).toBeInTheDocument();
      expect(screen.getByTestId('icon-x-circle')).toBeInTheDocument();
    });
  });

  describe('Usage Statistics', () => {
    test('renders usage count and limit', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText(/Used: 1,500 leads/)).toBeInTheDocument();
      expect(screen.getByText(/Limit: 2,000/)).toBeInTheDocument();
    });

    test('renders usage percentage', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('75.0% used')).toBeInTheDocument();
    });

    test('renders remaining leads', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('500 remaining')).toBeInTheDocument();
    });

    test('shows red progress bar for high usage (>= 90%)', () => {
      const { container } = render(
        <UserDetailsModal
          {...defaultProps}
          user={{ ...mockUser, usage_count: 1900, usage_limit: 2000 }}
        />
      );

      const progressBar = container.querySelector('.bg-red-600');
      expect(progressBar).toBeInTheDocument();
    });

    test('shows orange progress bar for medium usage (>= 70%)', () => {
      const { container } = render(
        <UserDetailsModal
          {...defaultProps}
          user={{ ...mockUser, usage_count: 1500, usage_limit: 2000 }}
        />
      );

      const progressBar = container.querySelector('.bg-orange-500');
      expect(progressBar).toBeInTheDocument();
    });

    test('shows green progress bar for low usage (< 70%)', () => {
      const { container } = render(
        <UserDetailsModal
          {...defaultProps}
          user={{ ...mockUser, usage_count: 500, usage_limit: 2000 }}
        />
      );

      const progressBar = container.querySelector('.bg-green-600');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Stripe Customer ID', () => {
    test('renders Stripe customer ID when present', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('cus_abc123')).toBeInTheDocument();
    });

    test('does not render Stripe section when not present', () => {
      render(
        <UserDetailsModal
          {...defaultProps}
          user={{ ...mockUser, stripe_customer_id: undefined }}
        />
      );

      expect(screen.queryByText('Stripe Customer ID')).not.toBeInTheDocument();
    });
  });

  describe('Timestamps', () => {
    test('renders account created date', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('Account Created')).toBeInTheDocument();
    });

    test('renders last updated date', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('Last Updated')).toBeInTheDocument();
    });

    test('renders last login when present', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('Last Login')).toBeInTheDocument();
    });

    test('does not render last login when not present', () => {
      render(
        <UserDetailsModal
          {...defaultProps}
          user={{ ...mockUser, last_login_at: undefined }}
        />
      );

      expect(screen.queryByText('Last Login')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    test('renders Close button', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    test('renders Suspend User button', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('Suspend User')).toBeInTheDocument();
    });

    test('renders Edit User button', () => {
      render(<UserDetailsModal {...defaultProps} />);

      expect(screen.getByText('Edit User')).toBeInTheDocument();
    });

    test('closes modal when Close button is clicked', () => {
      render(<UserDetailsModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Close'));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test('calls onSuspend with user id and name when Suspend is clicked', () => {
      render(<UserDetailsModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Suspend User'));

      expect(mockOnSuspend).toHaveBeenCalledWith(42, 'Jane Smith');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test('calls onEdit with user when Edit is clicked', () => {
      render(<UserDetailsModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Edit User'));

      expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Null User', () => {
    test('returns null when user is null', () => {
      const { container } = render(
        <UserDetailsModal {...defaultProps} user={null} />
      );

      expect(container.innerHTML).toBe('');
    });
  });

  describe('Closed State', () => {
    test('does not render when open is false', () => {
      const { container } = render(
        <UserDetailsModal {...defaultProps} open={false} />
      );

      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });
});
