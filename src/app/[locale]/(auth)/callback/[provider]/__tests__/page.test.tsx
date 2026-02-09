import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import OAuthCallbackPage from '../page'

// Mock next/navigation
const mockPush = jest.fn()
const mockSearchParams = new URLSearchParams()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: 'en', provider: 'google' }),
  useSearchParams: () => mockSearchParams,
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      signingIn: 'Signing you in...',
      signingInDescription: 'Please wait while we complete your sign-in.',
      error: 'Authentication Failed',
      invalidProvider: 'Invalid authentication provider.',
      invalidState: 'Invalid authentication state. Please try again.',
      oauthFailed: 'Authentication failed. Please try again.',
      accountExists: 'An account with this email already exists with a different provider.',
      accessDenied: 'Access was denied. Please try again.',
      genericError: 'Something went wrong. Please try again.',
      backToLogin: 'Back to Login',
    }
    return translations[key] || key
  },
}))

// Mock auth store
const mockStoreLogin = jest.fn()
jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: any) =>
    selector({ login: mockStoreLogin }),
}))

// Mock auth service
jest.mock('@/services/auth.service', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    saveAuth: jest.fn(),
    clearAuth: jest.fn(),
    getStoredUser: jest.fn(() => null),
    getStoredToken: jest.fn(() => null),
  },
}))

describe('OAuthCallbackPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset search params
    mockSearchParams.delete('token')
    mockSearchParams.delete('is_new')
    mockSearchParams.delete('error')
  })

  describe('Loading state', () => {
    it('shows loading spinner while processing', () => {
      mockSearchParams.set('token', 'valid-jwt-token')
      render(<OAuthCallbackPage />)

      expect(screen.getByText('Signing you in...')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we complete your sign-in.')).toBeInTheDocument()
    })
  })

  describe('Successful OAuth callback', () => {
    it('stores token and redirects to dashboard on success', async () => {
      mockSearchParams.set('token', 'valid-jwt-token')
      mockSearchParams.set('is_new', 'false')

      render(<OAuthCallbackPage />)

      await waitFor(() => {
        expect(mockStoreLogin).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('redirects to dashboard for new users', async () => {
      mockSearchParams.set('token', 'valid-jwt-token')
      mockSearchParams.set('is_new', 'true')

      render(<OAuthCallbackPage />)

      await waitFor(() => {
        expect(mockStoreLogin).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Error handling', () => {
    it('shows error when token is missing', async () => {
      // No token in search params
      render(<OAuthCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument()
      })
    })

    it('shows error for invalid_state error param', async () => {
      mockSearchParams.set('error', 'invalid_state')

      render(<OAuthCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument()
        expect(screen.getByText('Invalid authentication state. Please try again.')).toBeInTheDocument()
      })
    })

    it('shows error for oauth_failed error param', async () => {
      mockSearchParams.set('error', 'oauth_failed')

      render(<OAuthCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument()
        expect(screen.getByText('Authentication failed. Please try again.')).toBeInTheDocument()
      })
    })

    it('shows error for account_exists error param', async () => {
      mockSearchParams.set('error', 'account_exists')

      render(<OAuthCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument()
        expect(screen.getByText('An account with this email already exists with a different provider.')).toBeInTheDocument()
      })
    })

    it('shows error for access_denied error param', async () => {
      mockSearchParams.set('error', 'access_denied')

      render(<OAuthCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument()
        expect(screen.getByText('Access was denied. Please try again.')).toBeInTheDocument()
      })
    })

    it('shows generic error for unknown error param', async () => {
      mockSearchParams.set('error', 'something_unknown')

      render(<OAuthCallbackPage />)

      await waitFor(() => {
        expect(screen.getByText('Authentication Failed')).toBeInTheDocument()
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
      })
    })

    it('renders a back to login link on error', async () => {
      mockSearchParams.set('error', 'oauth_failed')

      render(<OAuthCallbackPage />)

      await waitFor(() => {
        const link = screen.getByText('Back to Login')
        expect(link).toBeInTheDocument()
        expect(link.closest('a')).toHaveAttribute('href', '/login')
      })
    })
  })
})
