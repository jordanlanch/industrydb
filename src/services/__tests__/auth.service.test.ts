import { authService } from '../auth.service'
import { apiClient } from '@/lib/api-client'
import type { AuthResponse, User } from '@/types'

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  subscription_tier: 'free',
  role: 'user',
  usage_count: 0,
  usage_limit: 50,
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z',
}

const mockAuthResponse: AuthResponse = {
  token: 'jwt-token-123',
  user: mockUser,
}

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})

describe('authService', () => {
  describe('login', () => {
    it('sends correct payload to /auth/login', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockAuthResponse })

      const credentials = { email: 'test@example.com', password: 'password123' }
      const result = await authService.login(credentials)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(result).toEqual(mockAuthResponse)
    })

    it('returns user and token from response', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockAuthResponse })

      const result = await authService.login({ email: 'test@example.com', password: 'pass' })

      expect(result.token).toBe('jwt-token-123')
      expect(result.user).toEqual(mockUser)
    })

    it('propagates API errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Invalid credentials'))

      await expect(
        authService.login({ email: 'bad@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('sends correct payload to /auth/register', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ data: mockAuthResponse })

      const registerData = {
        email: 'new@example.com',
        password: 'securepass',
        name: 'New User',
      }
      const result = await authService.register(registerData)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/register', registerData)
      expect(result).toEqual(mockAuthResponse)
    })

    it('propagates API errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Email already exists'))

      await expect(
        authService.register({ email: 'dup@example.com', password: 'pass', name: 'Dup' })
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('getCurrentUser', () => {
    it('calls GET /auth/me and returns user', async () => {
      mockedApiClient.get.mockResolvedValueOnce({ data: mockUser })

      const result = await authService.getCurrentUser()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/me', undefined)
      expect(result).toEqual(mockUser)
    })

    it('propagates errors (e.g. unauthorized)', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized')
    })
  })

  describe('saveAuth', () => {
    it('saves token and user to localStorage', () => {
      authService.saveAuth('my-token', mockUser)

      expect(localStorage.getItem('auth_token')).toBe('my-token')
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser)
    })
  })

  describe('clearAuth', () => {
    it('removes token and user from localStorage', () => {
      localStorage.setItem('auth_token', 'some-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      authService.clearAuth()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('getStoredToken', () => {
    it('returns token from localStorage', () => {
      localStorage.setItem('auth_token', 'stored-token')

      expect(authService.getStoredToken()).toBe('stored-token')
    })

    it('returns null when no token stored', () => {
      expect(authService.getStoredToken()).toBeNull()
    })
  })

  describe('getStoredUser', () => {
    it('returns parsed user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser))

      expect(authService.getStoredUser()).toEqual(mockUser)
    })

    it('returns null when no user stored', () => {
      expect(authService.getStoredUser()).toBeNull()
    })
  })
})
