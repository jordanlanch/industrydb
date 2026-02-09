import { apiClient } from '@/lib/api-client'
import { setSentryUser, addSentryBreadcrumb } from '@/lib/sentry'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    addSentryBreadcrumb('auth', 'User login attempt', { email: data.email })
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    setSentryUser(response.data.user)
    addSentryBreadcrumb('auth', 'User login success', { userId: response.data.user.id })
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    addSentryBreadcrumb('auth', 'User registration attempt', { email: data.email })
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    setSentryUser(response.data.user)
    addSentryBreadcrumb('auth', 'User registration success', { userId: response.data.user.id })
    return response.data
  },

  async getCurrentUser(token?: string): Promise<User> {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined
    const response = await apiClient.get<User>('/auth/me', config)
    return response.data
  },

  saveAuth(token: string, user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
  },

  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
    setSentryUser(null)
    addSentryBreadcrumb('auth', 'User logged out')
  },

  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  },

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  },
}
