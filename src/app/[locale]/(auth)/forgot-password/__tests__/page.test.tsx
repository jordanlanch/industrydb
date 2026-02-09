import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordPage from '../page'
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
      title: 'Forgot Password?',
      subtitle:
        "Enter your email address and we'll send you a link to reset your password",
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      submit: 'Send Reset Link',
      sending: 'Sending...',
      backToLogin: 'Back to Login',
      success: 'Check Your Email',
      successMessage: 'We sent a password reset link to',
      successDescription:
        'Please check your email and click the link to reset your password. The link will expire in 1 hour.',
      successButton: 'Back to Login',
      resendButton: 'Send Another Email',
      error: 'Failed to send reset link',
    }
    return translations[key] || key
  },
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders email input and submit button', () => {
      render(<ForgotPasswordPage />)

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
    })

    it('renders title and subtitle', () => {
      render(<ForgotPasswordPage />)

      expect(screen.getByText('Forgot Password?')).toBeInTheDocument()
      expect(
        screen.getByText(
          "Enter your email address and we'll send you a link to reset your password"
        )
      ).toBeInTheDocument()
    })

    it('renders email input with correct type and placeholder', () => {
      render(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText('Email Address')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')
    })

    it('renders back to login link', () => {
      render(<ForgotPasswordPage />)

      const link = screen.getByText('Back to Login')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/login')
    })
  })

  describe('Email validation', () => {
    it('has required attribute on email input', () => {
      render(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText('Email Address')
      expect(emailInput).toBeRequired()
    })

    it('has email type for browser validation', () => {
      render(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText('Email Address')
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Form submission', () => {
    it('calls API with correct email on submit', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/forgot-password'),
          { email: 'test@example.com' }
        )
      })
    })

    it('shows loading state during submission', async () => {
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument()
      })
    })

    it('disables input during submission', async () => {
      mockedAxios.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByLabelText('Email Address')).toBeDisabled()
      })
    })
  })

  describe('Success state', () => {
    it('shows success message after submission', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument()
      })
    })

    it('shows the email address in success message', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    it('shows back to login button in success state', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back to Login' })).toBeInTheDocument()
      })
    })

    it('shows resend button in success state', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Send Another Email' })
        ).toBeInTheDocument()
      })
    })

    it('navigates to login when back to login clicked', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back to Login' })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: 'Back to Login' }))

      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('returns to form when resend button clicked', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Send Another Email' })
        ).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: 'Send Another Email' }))

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('displays error message on API failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: 'User not found' } },
      })

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument()
      })
    })

    it('displays generic error when no API message', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

      render(<ForgotPasswordPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByText('Failed to send reset link')).toBeInTheDocument()
      })
    })
  })
})
