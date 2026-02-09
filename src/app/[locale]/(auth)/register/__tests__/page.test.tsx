import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '../page'

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
      title: 'Create an account',
      subtitle: 'Start with 50 free leads per month',
      name: 'Full Name',
      namePlaceholder: 'John Doe',
      email: 'Email Address',
      emailPlaceholder: 'you@example.com',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      submit: 'Create account',
      submitting: 'Creating account...',
      hasAccount: 'Already have an account?',
      signIn: 'Sign in',
      passwordRequirements: 'Password must contain:',
      requirementLength: 'At least 8 characters',
      requirementUppercase: 'One uppercase letter',
      requirementLowercase: 'One lowercase letter',
      requirementNumber: 'One number',
      error: 'Registration failed. Please try again.',
    }
    return translations[key] || key
  },
}))

// Mock auth service
const mockRegister = jest.fn()
jest.mock('@/services/auth.service', () => ({
  authService: {
    register: (...args: any[]) => mockRegister(...args),
    login: jest.fn(),
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

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders register form with name, email, password fields and terms checkbox', () => {
      render(<RegisterPage />)

      expect(screen.getByText('Create an account')).toBeInTheDocument()
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders subtitle text', () => {
      render(<RegisterPage />)

      expect(screen.getByText('Start with 50 free leads per month')).toBeInTheDocument()
    })

    it('renders submit button', () => {
      render(<RegisterPage />)

      expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
    })

    it('renders sign in link for existing users', () => {
      render(<RegisterPage />)

      const link = screen.getByText('Sign in')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/login')
    })
  })

  describe('Terms and Privacy links', () => {
    it('renders Terms of Service link pointing to /terms', () => {
      render(<RegisterPage />)

      const link = screen.getByText('Terms of Service')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/terms')
    })

    it('renders Privacy Policy link pointing to /privacy', () => {
      render(<RegisterPage />)

      const link = screen.getByText('Privacy Policy')
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/privacy')
    })
  })

  describe('Password strength indicators', () => {
    it('shows password requirements text', () => {
      render(<RegisterPage />)

      expect(screen.getByText('Password must contain:')).toBeInTheDocument()
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
      expect(screen.getByText('One uppercase letter')).toBeInTheDocument()
      expect(screen.getByText('One lowercase letter')).toBeInTheDocument()
      expect(screen.getByText('One number')).toBeInTheDocument()
    })

    it('highlights length requirement when password has 8+ chars', async () => {
      render(<RegisterPage />)

      const passwordInput = screen.getByLabelText('Password')
      await userEvent.type(passwordInput, 'abcdefgh')

      const lengthReq = screen.getByText('At least 8 characters')
      expect(lengthReq.closest('div')).toHaveClass('text-green-600')
    })

    it('highlights uppercase requirement when password has uppercase', async () => {
      render(<RegisterPage />)

      const passwordInput = screen.getByLabelText('Password')
      await userEvent.type(passwordInput, 'A')

      const uppercaseReq = screen.getByText('One uppercase letter')
      expect(uppercaseReq.closest('div')).toHaveClass('text-green-600')
    })

    it('highlights lowercase requirement when password has lowercase', async () => {
      render(<RegisterPage />)

      const passwordInput = screen.getByLabelText('Password')
      await userEvent.type(passwordInput, 'a')

      const lowercaseReq = screen.getByText('One lowercase letter')
      expect(lowercaseReq.closest('div')).toHaveClass('text-green-600')
    })

    it('highlights number requirement when password has number', async () => {
      render(<RegisterPage />)

      const passwordInput = screen.getByLabelText('Password')
      await userEvent.type(passwordInput, '1')

      const numberReq = screen.getByText('One number')
      expect(numberReq.closest('div')).toHaveClass('text-green-600')
    })
  })

  describe('Zod validation', () => {
    it('shows error for name shorter than 2 characters', async () => {
      render(<RegisterPage />)

      const nameInput = screen.getByLabelText('Full Name')
      await userEvent.type(nameInput, 'A')
      fireEvent.blur(nameInput)

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
      })
    })

    it('shows error for invalid email format', async () => {
      render(<RegisterPage />)

      const emailInput = screen.getByLabelText('Email Address')
      await userEvent.type(emailInput, 'invalid-email')
      fireEvent.blur(emailInput)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('marks password as invalid and does not highlight length when too short', async () => {
      render(<RegisterPage />)

      const passwordInput = screen.getByLabelText('Password')
      fireEvent.focus(passwordInput)
      fireEvent.change(passwordInput, { target: { value: 'Ab1' } })
      fireEvent.blur(passwordInput)

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true')
      })

      const lengthReq = screen.getByText('At least 8 characters')
      expect(lengthReq.closest('div')).not.toHaveClass('text-green-600')
    })

    it('marks password as invalid and does not highlight uppercase when missing', async () => {
      render(<RegisterPage />)

      const passwordInput = screen.getByLabelText('Password')
      fireEvent.focus(passwordInput)
      fireEvent.change(passwordInput, { target: { value: 'abcdefg1' } })
      fireEvent.blur(passwordInput)

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true')
      })

      const uppercaseReq = screen.getByText('One uppercase letter')
      expect(uppercaseReq.closest('div')).not.toHaveClass('text-green-600')
    })

    it('marks password as invalid and does not highlight lowercase when missing', async () => {
      render(<RegisterPage />)

      const passwordInput = screen.getByLabelText('Password')
      fireEvent.focus(passwordInput)
      fireEvent.change(passwordInput, { target: { value: 'ABCDEFG1' } })
      fireEvent.blur(passwordInput)

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true')
      })

      const lowercaseReq = screen.getByText('One lowercase letter')
      expect(lowercaseReq.closest('div')).not.toHaveClass('text-green-600')
    })

    it('marks password as invalid and does not highlight number when missing', async () => {
      render(<RegisterPage />)

      const passwordInput = screen.getByLabelText('Password')
      fireEvent.focus(passwordInput)
      fireEvent.change(passwordInput, { target: { value: 'Abcdefgh' } })
      fireEvent.blur(passwordInput)

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true')
      })

      const numberReq = screen.getByText('One number')
      expect(numberReq.closest('div')).not.toHaveClass('text-green-600')
    })

    it('shows error for name with special characters', async () => {
      render(<RegisterPage />)

      const nameInput = screen.getByLabelText('Full Name')
      await userEvent.type(nameInput, 'John123')
      fireEvent.blur(nameInput)

      await waitFor(() => {
        expect(
          screen.getByText('Name can only contain letters and spaces')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Terms checkbox', () => {
    it('submit button is disabled when terms are not accepted', async () => {
      render(<RegisterPage />)

      await userEvent.type(screen.getByLabelText('Full Name'), 'John Doe')
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'Password1')

      const submitButton = screen.getByRole('button', { name: 'Create account' })
      expect(submitButton).toBeDisabled()
    })

    it('submit button is enabled when all fields valid and terms accepted', async () => {
      render(<RegisterPage />)

      await userEvent.type(screen.getByLabelText('Full Name'), 'John Doe')
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'Password1')

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      const submitButton = screen.getByRole('button', { name: 'Create account' })
      expect(submitButton).toBeEnabled()
    })
  })

  describe('Form submission', () => {
    it('calls authService.register on valid submit', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        subscription_tier: 'free' as const,
        role: 'user' as const,
        usage_count: 0,
        usage_limit: 50,
        email_verified: false,
        created_at: '2026-01-01T00:00:00Z',
      }

      mockRegister.mockResolvedValueOnce({
        token: 'test-token',
        user: mockUser,
      })

      render(<RegisterPage />)

      await userEvent.type(screen.getByLabelText('Full Name'), 'John Doe')
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'Password1')

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password1',
        })
      })
    })

    it('stores auth and redirects to onboarding on success', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        subscription_tier: 'free' as const,
        role: 'user' as const,
        usage_count: 0,
        usage_limit: 50,
        email_verified: false,
        created_at: '2026-01-01T00:00:00Z',
      }

      mockRegister.mockResolvedValueOnce({
        token: 'test-token',
        user: mockUser,
      })

      render(<RegisterPage />)

      await userEvent.type(screen.getByLabelText('Full Name'), 'John Doe')
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'Password1')

      fireEvent.click(screen.getByRole('checkbox'))
      fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

      await waitFor(() => {
        expect(mockStoreLogin).toHaveBeenCalledWith('test-token', mockUser)
        expect(mockPush).toHaveBeenCalledWith('/onboarding')
      })
    })

    it('displays API error messages on failure', async () => {
      mockRegister.mockRejectedValueOnce({
        response: { data: { message: 'Email already registered' } },
      })

      render(<RegisterPage />)

      await userEvent.type(screen.getByLabelText('Full Name'), 'John Doe')
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'Password1')

      fireEvent.click(screen.getByRole('checkbox'))
      fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Email already registered')
      })
    })

    it('falls back to generic error when no API message available', async () => {
      mockRegister.mockRejectedValueOnce(new Error('Network error'))

      render(<RegisterPage />)

      await userEvent.type(screen.getByLabelText('Full Name'), 'John Doe')
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'Password1')

      fireEvent.click(screen.getByRole('checkbox'))
      fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Registration failed. Please try again.')
      })
    })
  })

  describe('Loading state', () => {
    it('shows loading text during submission', async () => {
      mockRegister.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<RegisterPage />)

      await userEvent.type(screen.getByLabelText('Full Name'), 'John Doe')
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'Password1')

      fireEvent.click(screen.getByRole('checkbox'))
      fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

      await waitFor(() => {
        expect(screen.getByText('Creating account...')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has aria-required on all required fields', () => {
      render(<RegisterPage />)

      expect(screen.getByLabelText('Full Name')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText('Email Address')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText('Password')).toHaveAttribute('aria-required', 'true')
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-required', 'true')
    })

    it('has password requirements linked via aria-describedby', () => {
      render(<RegisterPage />)

      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-requirements')
      expect(document.getElementById('password-requirements')).toBeInTheDocument()
    })

    it('sets aria-describedby on checkbox when terms validation error exists', async () => {
      render(<RegisterPage />)

      // Fill in all fields except terms to trigger terms validation on submit
      await userEvent.type(screen.getByLabelText('Full Name'), 'John Doe')
      await userEvent.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await userEvent.type(screen.getByLabelText('Password'), 'Password1')

      // Submit form directly (button is disabled because terms not checked, so use form submit)
      const form = screen.getByRole('button', { name: 'Create account' }).closest('form')!
      fireEvent.submit(form)

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toHaveAttribute('aria-describedby', 'terms-error')
        expect(checkbox).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })
})
