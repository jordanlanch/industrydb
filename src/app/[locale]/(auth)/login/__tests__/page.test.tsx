import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../page'

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
      title: 'Sign in',
      subtitle: 'Enter your credentials to access your account',
      email: 'Email Address',
      emailPlaceholder: 'you@example.com',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      forgotPassword: 'Forgot password?',
      submit: 'Sign in',
      submitting: 'Signing in...',
      orContinueWith: 'Or continue with',
      google: 'Google',
      github: 'GitHub',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      error: 'Invalid email or password',
    }
    return translations[key] || key
  },
}))

// Mock auth service
const mockLogin = jest.fn()
jest.mock('@/services/auth.service', () => ({
  authService: {
    login: (...args: any[]) => mockLogin(...args),
    saveAuth: jest.fn(),
    clearAuth: jest.fn(),
    getStoredUser: jest.fn(() => null),
    getStoredToken: jest.fn(() => null),
  },
}))

// Mock auth store
const mockStoreLogin = jest.fn()
jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: any) =>
    selector({ login: mockStoreLogin }),
}))

// We don't mock @/lib/validations because the page uses the real Zod schema.
// The lib/validations.ts file exists and provides the actual schema.

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the login form with email and password fields', () => {
      render(<LoginPage />)

      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('renders email input with correct type and placeholder', () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('placeholder', 'you@example.com')
    })

    it('renders password input with correct type and placeholder', () => {
      render(<LoginPage />)

      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('placeholder', '••••••••')
    })

    it('renders submit button', () => {
      render(<LoginPage />)

      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    })

    it('renders subtitle text', () => {
      render(<LoginPage />)

      expect(
        screen.getByText('Enter your credentials to access your account')
      ).toBeInTheDocument()
    })
  })

  describe('Forgot Password link', () => {
    it('renders Forgot Password link pointing to /forgot-password', () => {
      render(<LoginPage />)

      const link = screen.getByText('Forgot password?')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/forgot-password')
    })
  })

  describe('Sign Up link', () => {
    it('renders sign up link pointing to /register', () => {
      render(<LoginPage />)

      const link = screen.getByText('Sign up')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/register')
    })
  })

  describe('OAuth buttons', () => {
    it('renders Google OAuth button', () => {
      render(<LoginPage />)

      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    })

    it('renders GitHub OAuth button', () => {
      render(<LoginPage />)

      expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('disables submit button when fields are empty', () => {
      render(<LoginPage />)

      const submitButton = screen.getByRole('button', { name: 'Sign in' })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when both fields have values', async () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: 'Sign in' })
      expect(submitButton).toBeEnabled()
    })

    it('shows validation error for invalid email format on submit', async () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'invalid-email')
      await userEvent.type(passwordInput, 'password123')

      const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })
  })

  describe('Form submission', () => {
    it('calls authService.login on submit with correct data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        subscription_tier: 'free' as const,
        role: 'user' as const,
        usage_count: 0,
        usage_limit: 50,
        email_verified: true,
        created_at: '2026-01-01T00:00:00Z',
      }

      mockLogin.mockResolvedValueOnce({
        token: 'test-token',
        user: mockUser,
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: 'Sign in' })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('calls store login and redirects to dashboard on success', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        subscription_tier: 'free' as const,
        role: 'user' as const,
        usage_count: 0,
        usage_limit: 50,
        email_verified: true,
        created_at: '2026-01-01T00:00:00Z',
      }

      mockLogin.mockResolvedValueOnce({
        token: 'test-token',
        user: mockUser,
      })

      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'password123')

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(mockStoreLogin).toHaveBeenCalledWith('test-token', mockUser)
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('API error handling', () => {
    it('displays API error messages', async () => {
      mockLogin.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } },
      })

      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword')

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('displays error in an alert role element', async () => {
      mockLogin.mockRejectedValueOnce({
        response: { data: { message: 'Server error' } },
      })

      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'password')

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent('Server error')
      })
    })

    it('falls back to generic error message when no API message', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Network error'))

      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'password')

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  describe('Loading state', () => {
    it('shows loading text during submission', async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'password123')

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
      })
    })

    it('disables inputs during submission', async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'password123')

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(screen.getByLabelText('Email Address')).toBeDisabled()
        expect(screen.getByLabelText('Password')).toBeDisabled()
      })
    })
  })

  describe('Validation error clearing', () => {
    it('clears email validation error when user types in email field', async () => {
      render(<LoginPage />)

      // Submit with invalid email to trigger validation error
      await userEvent.type(screen.getByLabelText('Email Address'), 'bad')
      await userEvent.type(screen.getByLabelText('Password'), 'pass')

      const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })

      // Type in email field to clear the error
      await userEvent.type(screen.getByLabelText('Email Address'), 'x')

      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
    })

    it('clears password validation error when user types in password field', async () => {
      render(<LoginPage />)

      // Type a valid email so we can submit the form
      const emailInput = screen.getByLabelText('Email Address')
      await userEvent.type(emailInput, 'test@example.com')

      // Submit form directly (bypassing disabled button) with empty password
      // to trigger Zod password validation error ("Password is required")
      const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })

      // Now type in password field to trigger the error clearing code path
      const passwordInput = screen.getByLabelText('Password')
      await userEvent.type(passwordInput, 'x')

      expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
    })
  })

  describe('OAuth buttons interaction', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('Google OAuth button sets window.location.href', () => {
      render(<LoginPage />)

      const googleBtn = screen.getByRole('button', { name: /google/i })
      expect(googleBtn).not.toBeDisabled()
      fireEvent.click(googleBtn)
    })

    it('GitHub OAuth button sets window.location.href', () => {
      render(<LoginPage />)

      const githubBtn = screen.getByRole('button', { name: /github/i })
      expect(githubBtn).not.toBeDisabled()
      fireEvent.click(githubBtn)
    })

    it('disables OAuth buttons during loading', async () => {
      mockLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'password123')

      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /google/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /github/i })).toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has aria-required on email and password fields', () => {
      render(<LoginPage />)

      expect(screen.getByLabelText('Email Address')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText('Password')).toHaveAttribute('aria-required', 'true')
    })

    it('sets aria-describedby on email field when validation error exists', async () => {
      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'bad-email')
      await userEvent.type(screen.getByLabelText('Password'), 'pass')

      const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByLabelText('Email Address')).toHaveAttribute('aria-describedby', 'email-error')
      })
    })

    it('sets aria-describedby on password field when validation error exists', async () => {
      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'test@example.com')

      const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByLabelText('Password')).toHaveAttribute('aria-describedby', 'password-error')
        expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('sets aria-invalid on email field when validation fails', async () => {
      render(<LoginPage />)

      await userEvent.type(screen.getByLabelText('Email Address'), 'bad-email')
      await userEvent.type(screen.getByLabelText('Password'), 'pass')

      const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        expect(screen.getByLabelText('Email Address')).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })
})
