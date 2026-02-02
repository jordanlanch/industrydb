import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailVerificationBanner } from '../email-verification-banner';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: ({ className, ...props }: any) => (
    <svg data-testid="alert-circle-icon" className={className} {...props} />
  ),
  X: ({ className, ...props }: any) => (
    <svg data-testid="x-icon" className={className} {...props} />
  ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

describe('EmailVerificationBanner', () => {
  const mockEmail = 'test@example.com';
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock_auth_token');
  });

  describe('Basic Rendering', () => {
    test('renders banner with email address', () => {
      render(<EmailVerificationBanner email={mockEmail} />);

      expect(screen.getByText('Please verify your email address')).toBeInTheDocument();
      expect(screen.getByText(/We sent a verification link to/i)).toBeInTheDocument();
      expect(screen.getByText(mockEmail)).toBeInTheDocument();
    });

    test('displays verification instructions', () => {
      render(<EmailVerificationBanner email={mockEmail} />);

      expect(
        screen.getByText(/Check your inbox and click the link to verify your account/i)
      ).toBeInTheDocument();
    });

    test('renders Resend Email button', () => {
      render(<EmailVerificationBanner email={mockEmail} />);

      expect(screen.getByText('Resend Email')).toBeInTheDocument();
    });

    test('renders dismiss button', () => {
      render(<EmailVerificationBanner email={mockEmail} />);

      const dismissButton = screen.getByLabelText('Dismiss email verification banner');
      expect(dismissButton).toBeInTheDocument();
    });

    test('renders alert icon', () => {
      render(<EmailVerificationBanner email={mockEmail} />);

      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has role="alert" on banner', () => {
      const { container } = render(<EmailVerificationBanner email={mockEmail} />);

      const banner = container.querySelector('[role="alert"]');
      expect(banner).toBeInTheDocument();
    });

    test('has aria-live="polite" on banner', () => {
      const { container } = render(<EmailVerificationBanner email={mockEmail} />);

      const banner = container.querySelector('[aria-live="polite"]');
      expect(banner).toBeInTheDocument();
    });

    test('has aria-atomic="true" on banner', () => {
      const { container } = render(<EmailVerificationBanner email={mockEmail} />);

      const banner = container.querySelector('[aria-atomic="true"]');
      expect(banner).toBeInTheDocument();
    });

    test('Resend button has aria-label', () => {
      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByLabelText('Resend verification email');
      expect(resendButton).toBeInTheDocument();
    });

    test('Dismiss button has aria-label', () => {
      render(<EmailVerificationBanner email={mockEmail} />);

      const dismissButton = screen.getByLabelText('Dismiss email verification banner');
      expect(dismissButton).toBeInTheDocument();
    });

    test('icons have aria-hidden', () => {
      render(<EmailVerificationBanner email={mockEmail} />);

      const alertIcon = screen.getByTestId('alert-circle-icon');
      const xIcon = screen.getByTestId('x-icon');

      expect(alertIcon).toHaveAttribute('aria-hidden', 'true');
      expect(xIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Resend Email - Success', () => {
    test('calls API when Resend Email is clicked', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/resend-verification'),
          {},
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock_auth_token',
            },
          })
        );
      });
    });

    test('shows loading state while sending', async () => {
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
      );

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      // Should show "Sending..." immediately
      expect(screen.getByText('Sending...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Resend Email')).toBeInTheDocument();
      });
    });

    test('disables button while sending', async () => {
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
      );

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email') as HTMLButtonElement;
      fireEvent.click(resendButton);

      // Button should be disabled while sending
      expect(resendButton).toBeDisabled();

      await waitFor(() => {
        expect(resendButton).not.toBeDisabled();
      });
    });

    test('shows success message on successful resend', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(
          screen.getByText('✓ Verification email sent! Please check your inbox.')
        ).toBeInTheDocument();
      });
    });

    test('success message has role="status"', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        const message = screen.getByRole('status');
        expect(message).toBeInTheDocument();
        expect(message).toHaveTextContent('✓ Verification email sent! Please check your inbox.');
      });
    });

    test('success message has correct styling', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        const message = screen.getByRole('status');
        expect(message.className).toContain('text-green-700');
      });
    });

    test('updates aria-label when sending', async () => {
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
      );

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByLabelText('Resend verification email');
      fireEvent.click(resendButton);

      expect(screen.getByLabelText('Sending verification email')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByLabelText('Resend verification email')).toBeInTheDocument();
      });
    });
  });

  describe('Resend Email - Error', () => {
    test('shows error message on API failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Rate limit exceeded',
          },
        },
      });

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(screen.getByText('✗ Rate limit exceeded')).toBeInTheDocument();
      });
    });

    test('shows generic error message when no API error message', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(
          screen.getByText('✗ Failed to send email. Please try again.')
        ).toBeInTheDocument();
      });
    });

    test('error message has correct styling', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        const message = screen.getByRole('status');
        expect(message.className).toContain('text-red-700');
      });
    });

    test('clears previous message before new request', async () => {
      // First request succeeds
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(
          screen.getByText('✓ Verification email sent! Please check your inbox.')
        ).toBeInTheDocument();
      });

      // Second request fails
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(
          screen.queryByText('✓ Verification email sent! Please check your inbox.')
        ).not.toBeInTheDocument();
        expect(
          screen.getByText('✗ Failed to send email. Please try again.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Dismiss Functionality', () => {
    test('dismisses banner when dismiss button is clicked', () => {
      const { container } = render(<EmailVerificationBanner email={mockEmail} />);

      const dismissButton = screen.getByLabelText('Dismiss email verification banner');
      fireEvent.click(dismissButton);

      // Banner should be removed from DOM
      expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
    });

    test('calls onDismiss callback when dismissed', () => {
      render(<EmailVerificationBanner email={mockEmail} onDismiss={mockOnDismiss} />);

      const dismissButton = screen.getByLabelText('Dismiss email verification banner');
      fireEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    test('does not call onDismiss if not provided', () => {
      render(<EmailVerificationBanner email={mockEmail} />);

      const dismissButton = screen.getByLabelText('Dismiss email verification banner');

      // Should not throw error
      expect(() => fireEvent.click(dismissButton)).not.toThrow();
    });

    test('banner stays dismissed after multiple renders', () => {
      const { container, rerender } = render(<EmailVerificationBanner email={mockEmail} />);

      const dismissButton = screen.getByLabelText('Dismiss email verification banner');
      fireEvent.click(dismissButton);

      // Re-render with same props
      rerender(<EmailVerificationBanner email={mockEmail} />);

      // Banner should still be dismissed
      expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    test('has yellow background', () => {
      const { container } = render(<EmailVerificationBanner email={mockEmail} />);

      const banner = container.querySelector('[role="alert"]');
      expect(banner?.className).toContain('bg-yellow-50');
      expect(banner?.className).toContain('border-yellow-200');
    });

    test('has correct layout classes', () => {
      const { container } = render(<EmailVerificationBanner email={mockEmail} />);

      const banner = container.querySelector('[role="alert"]');
      expect(banner?.className).toContain('border-b');
    });
  });

  describe('Authentication', () => {
    test('uses token from localStorage', async () => {
      const mockToken = 'test_auth_token_123';
      Storage.prototype.getItem = jest.fn(() => mockToken);
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          {},
          expect.objectContaining({
            headers: {
              Authorization: `Bearer ${mockToken}`,
            },
          })
        );
      });
    });

    test('works when localStorage has no token', async () => {
      Storage.prototype.getItem = jest.fn(() => null);
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          {},
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer null',
            },
          })
        );
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles very long email addresses', () => {
      const longEmail = 'very.long.email.address.that.might.break.layout@example.com';
      render(<EmailVerificationBanner email={longEmail} />);

      expect(screen.getByText(longEmail)).toBeInTheDocument();
    });

    test('handles multiple rapid clicks on Resend button', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      render(<EmailVerificationBanner email={mockEmail} />);

      const resendButton = screen.getByText('Resend Email');

      // Click multiple times rapidly
      fireEvent.click(resendButton);
      fireEvent.click(resendButton);
      fireEvent.click(resendButton);

      await waitFor(() => {
        // Should only call API once (button is disabled after first click)
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });
    });

    test('renders without onDismiss callback', () => {
      expect(() => render(<EmailVerificationBanner email={mockEmail} />)).not.toThrow();
    });
  });
});
