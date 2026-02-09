import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InviteMemberModal } from '../invite-member-modal';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  UserPlus: (props: any) => <svg data-testid="icon-user-plus" {...props} />,
  Mail: (props: any) => <svg data-testid="icon-mail" {...props} />,
  Shield: (props: any) => <svg data-testid="icon-shield" {...props} />,
  Loader2: (props: any) => <svg data-testid="icon-loader" {...props} />,
  ChevronDown: (props: any) => <svg data-testid="icon-chevron-down" {...props} />,
}));

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} type={type || 'button'} {...props}>
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

// Mock toast
const mockToast = jest.fn();
jest.mock('@/components/toast-provider', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock organization service
const mockInviteMember = jest.fn();
jest.mock('@/services/organization.service', () => ({
  __esModule: true,
  default: {
    inviteMember: (...args: any[]) => mockInviteMember(...args),
  },
}));

describe('InviteMemberModal', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    organizationId: 1,
    organizationName: 'Acme Corp',
    open: true,
    onOpenChange: mockOnOpenChange,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockInviteMember.mockResolvedValue({ message: 'Invitation sent' });
  });

  describe('Rendering', () => {
    test('renders modal title', () => {
      render(<InviteMemberModal {...defaultProps} />);

      expect(screen.getByText('Invite Member')).toBeInTheDocument();
    });

    test('renders organization name in description', () => {
      render(<InviteMemberModal {...defaultProps} />);

      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    test('renders email input', () => {
      render(<InviteMemberModal {...defaultProps} />);

      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('colleague@example.com')).toBeInTheDocument();
    });

    test('renders role selection', () => {
      render(<InviteMemberModal {...defaultProps} />);

      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    test('renders Cancel and Send Invitation buttons', () => {
      render(<InviteMemberModal {...defaultProps} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Send Invitation')).toBeInTheDocument();
    });

    test('renders invitation helper text', () => {
      render(<InviteMemberModal {...defaultProps} />);

      expect(
        screen.getByText("We'll send an invitation email to this address")
      ).toBeInTheDocument();
    });
  });

  describe('Email Input Validation', () => {
    test('shows error when submitting with empty email', async () => {
      render(<InviteMemberModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Send Invitation'));

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(mockInviteMember).not.toHaveBeenCalled();
    });

    test('shows error for invalid email format', async () => {
      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

      // Submit form directly to bypass native HTML5 email validation in jsdom
      const form = emailInput.closest('form')!;
      fireEvent.submit(form);

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      expect(mockInviteMember).not.toHaveBeenCalled();
    });

    test('clears email error when user starts typing', () => {
      render(<InviteMemberModal {...defaultProps} />);

      // Submit empty to trigger error
      fireEvent.click(screen.getByText('Send Invitation'));
      expect(screen.getByText('Email is required')).toBeInTheDocument();

      // Start typing to clear error
      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'a' } });

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });

    test('accepts valid email addresses', async () => {
      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      await waitFor(() => {
        expect(mockInviteMember).toHaveBeenCalled();
      });
    });
  });

  describe('Role Selection', () => {
    test('defaults to "member" role', () => {
      render(<InviteMemberModal {...defaultProps} />);

      // The select shows "member" as default value
      expect(screen.getByText('member')).toBeInTheDocument();
    });

    test('shows role options when dropdown is opened', () => {
      render(<InviteMemberModal {...defaultProps} />);

      // Open the role dropdown
      const roleTrigger = screen.getByText('member').closest('button');
      if (roleTrigger) fireEvent.click(roleTrigger);

      expect(screen.getByText('Viewer')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    test('shows role descriptions', () => {
      render(<InviteMemberModal {...defaultProps} />);

      // The default role description is shown
      expect(
        screen.getByText('Can access and use organization resources')
      ).toBeInTheDocument();
    });

    test('allows selecting a different role', () => {
      render(<InviteMemberModal {...defaultProps} />);

      // Open dropdown
      const roleTrigger = screen.getByText('member').closest('button');
      if (roleTrigger) fireEvent.click(roleTrigger);

      // Select admin
      fireEvent.click(screen.getByText('Manage members and settings'));

      expect(
        screen.getByText('Can manage members and organization settings')
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits with correct data', async () => {
      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      await waitFor(() => {
        expect(mockInviteMember).toHaveBeenCalledWith(1, {
          email: 'new@example.com',
          role: 'member',
        });
      });
    });

    test('shows loading state during submission', async () => {
      mockInviteMember.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ message: 'Sent' }), 100))
      );

      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      expect(screen.getByText('Inviting...')).toBeInTheDocument();
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Inviting...')).not.toBeInTheDocument();
      });
    });

    test('disables inputs during submission', async () => {
      mockInviteMember.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ message: 'Sent' }), 100))
      );

      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      expect(emailInput).toBeDisabled();

      await waitFor(() => {
        expect(emailInput).not.toBeDisabled();
      });
    });

    test('shows success toast on successful invite', async () => {
      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Member invited successfully',
            variant: 'success',
          })
        );
      });
    });

    test('resets form after successful invite', async () => {
      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    test('calls onSuccess callback after successful invite', async () => {
      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error toast on API failure', async () => {
      mockInviteMember.mockRejectedValue({
        response: { data: { error: 'User already invited' } },
      });

      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to invite member',
            description: 'User already invited',
            variant: 'destructive',
          })
        );
      });
    });

    test('shows generic error message on unknown error', async () => {
      mockInviteMember.mockRejectedValue(new Error('Network error'));

      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to invite member',
            description: 'Network error',
            variant: 'destructive',
          })
        );
      });
    });

    test('does not close modal on error', async () => {
      mockInviteMember.mockRejectedValue(new Error('Failed'));

      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      await waitFor(() => {
        expect(mockOnOpenChange).not.toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('Cancel', () => {
    test('closes modal when Cancel is clicked', () => {
      render(<InviteMemberModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test('Cancel button is disabled during loading', async () => {
      mockInviteMember.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ message: 'Sent' }), 100))
      );

      render(<InviteMemberModal {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('colleague@example.com');
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.click(screen.getByText('Send Invitation'));

      expect(screen.getByText('Cancel')).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Cancel')).not.toBeDisabled();
      });
    });
  });

  describe('Closed State', () => {
    test('does not render when open is false', () => {
      render(<InviteMemberModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Invite Member')).not.toBeInTheDocument();
    });
  });
});
