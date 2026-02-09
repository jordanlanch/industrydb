import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetPasswordPage from '../page'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: 'en' }),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Reset Your Password',
      subtitle: 'Enter your new password below',
      password: 'New Password',
      passwordPlaceholder: 'At least 8 characters',
      confirmPassword: 'Confirm New Password',
      confirmPasswordPlaceholder: 'Re-enter your password',
      submit: 'Reset Password',
      submitting: 'Resetting...',
      cancel: 'Cancel',
      success: 'Password Reset!',
      successMessage: 'Password reset successfully!',
      redirecting: 'Redirecting to login in 3 seconds...',
      goToLogin: 'Go to Login Now',
      error: 'Failed to reset password. The link may be invalid or expired.',
      passwordMismatch: "Passwords don't match",
      passwordTooShort: 'Password must be at least 8 characters',
      requirements: 'Password requirements:',
      requirementLength: 'At least 8 characters',
      requirementMatch: 'Passwords match',
    }
    return translations[key] || key
  },
}))

describe('ResetPasswordPage', () => {
  const defaultProps = {
    params: { token: 'test-reset-token-123' },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders new password and confirm password fields', () => {
      render(<ResetPasswordPage {...defaultProps} />)

      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument()
    })

    it('renders title and subtitle', () => {
      render(<ResetPasswordPage {...defaultProps} />)

      expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
      expect(screen.getByText('Enter your new password below')).toBeInTheDocument()
    })

    it('renders submit button', () => {
      render(<ResetPasswordPage {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument()
    })

    it('renders cancel button', () => {
      render(<ResetPasswordPage {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('renders password requirements', () => {
      render(<ResetPasswordPage {...defaultProps} />)

      expect(screen.getByText('Password requirements:')).toBeInTheDocument()
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
      expect(screen.getByText('Passwords match')).toBeInTheDocument()
    })

    it('renders password toggle buttons', () => {
      render(<ResetPasswordPage {...defaultProps} />)

      // There should be two toggle buttons (one per password field)
      const toggleButtons = screen.getAllByRole('button').filter(
        (btn) => btn.getAttribute('type') === 'button' && !btn.textContent
      )
      // Password toggle buttons exist (they contain only icons, no text)
      expect(toggleButtons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Password validation', () => {
    it('shows error when passwords do not match', async () => {
      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'Password1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'Password2'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
      })
    })

    it('shows error when password is less than 8 characters', async () => {
      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'short')
      await userEvent.type(screen.getByLabelText('Confirm New Password'), 'short')

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters')
        ).toBeInTheDocument()
      })
    })

    it('prioritizes mismatch error over length error', async () => {
      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'abc')
      await userEvent.type(screen.getByLabelText('Confirm New Password'), 'xyz')

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument()
      })
    })
  })

  describe('Password requirement indicators', () => {
    it('highlights length requirement when password has 8+ chars', async () => {
      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'abcdefgh')

      const lengthReq = screen.getByText('At least 8 characters')
      expect(lengthReq.closest('li')).toHaveClass('text-green-600')
    })

    it('highlights match requirement when passwords match', async () => {
      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'Password1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'Password1'
      )

      const matchReq = screen.getByText('Passwords match')
      expect(matchReq.closest('li')).toHaveClass('text-green-600')
    })
  })

  describe('Token usage', () => {
    it('uses token from URL params in API call', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/reset-password'),
          {
            token: 'test-reset-token-123',
            new_password: 'NewPassword1',
          }
        )
      })
    })
  })

  describe('Form submission', () => {
    it('shows loading state during submission', async () => {
      let resolvePost: (value: any) => void
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => { resolvePost = resolve })
      )

      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(screen.getByText('Resetting...')).toBeInTheDocument()
      })

      // Clean up: resolve the pending promise
      await act(async () => {
        resolvePost!({ data: {} })
      })
    })

    it('disables inputs during submission', async () => {
      let resolvePost: (value: any) => void
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => { resolvePost = resolve })
      )

      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(screen.getByLabelText('New Password')).toBeDisabled()
        expect(screen.getByLabelText('Confirm New Password')).toBeDisabled()
      })

      // Clean up
      await act(async () => {
        resolvePost!({ data: {} })
      })
    })

    it('does not call API when validation fails', async () => {
      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'a')
      await userEvent.type(screen.getByLabelText('Confirm New Password'), 'b')

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      expect(mockedAxios.post).not.toHaveBeenCalled()
    })
  })

  describe('Success state', () => {
    it('shows success message after successful reset', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(screen.getByText('Password Reset!')).toBeInTheDocument()
        expect(screen.getByText('Password reset successfully!')).toBeInTheDocument()
      })
    })

    it('shows redirect message in success state', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(
          screen.getByText('Redirecting to login in 3 seconds...')
        ).toBeInTheDocument()
      })
    })

    it('shows go to login button in success state', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Go to Login Now' })
        ).toBeInTheDocument()
      })
    })

    it('auto-redirects to login after 3 seconds', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ResetPasswordPage {...defaultProps} />)

      await user.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await user.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(screen.getByText('Password Reset!')).toBeInTheDocument()
      })

      act(() => {
        jest.advanceTimersByTime(3000)
      })

      expect(mockPush).toHaveBeenCalledWith('/login')

      jest.useRealTimers()
    })
  })

  describe('Error handling', () => {
    it('displays API error message', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: 'Token expired' } },
      })

      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(screen.getByText('Token expired')).toBeInTheDocument()
      })
    })

    it('displays generic error when no API message', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(
          screen.getByText(
            'Failed to reset password. The link may be invalid or expired.'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('navigates to login when cancel button clicked', () => {
      render(<ResetPasswordPage {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('navigates to login when go to login button clicked in success state', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ResetPasswordPage {...defaultProps} />)

      await userEvent.type(screen.getByLabelText('New Password'), 'NewPassword1')
      await userEvent.type(
        screen.getByLabelText('Confirm New Password'),
        'NewPassword1'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Go to Login Now' })
        ).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: 'Go to Login Now' }))

      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('Password visibility toggle', () => {
    it('toggles password visibility for new password field', async () => {
      render(<ResetPasswordPage {...defaultProps} />)

      const passwordInput = screen.getByLabelText('New Password')
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Find the toggle button in the password field's container
      const passwordContainer = passwordInput.closest('.relative')!
      const toggleButton = passwordContainer.querySelector('button[type="button"]')!

      fireEvent.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')

      fireEvent.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('toggles password visibility for confirm password field', async () => {
      render(<ResetPasswordPage {...defaultProps} />)

      const confirmInput = screen.getByLabelText('Confirm New Password')
      expect(confirmInput).toHaveAttribute('type', 'password')

      const confirmContainer = confirmInput.closest('.relative')!
      const toggleButton = confirmContainer.querySelector('button[type="button"]')!

      fireEvent.click(toggleButton)

      expect(confirmInput).toHaveAttribute('type', 'text')
    })
  })
})
