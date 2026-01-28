import { create } from 'zustand'
import type { User } from '@/types'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (token: string, user: User) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => set({ token }),

  login: (token, user) => {
    authService.saveAuth(token, user)
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    authService.clearAuth()
    set({ token: null, user: null, isAuthenticated: false })
  },

  initialize: () => {
    const token = authService.getStoredToken()
    const user = authService.getStoredUser()

    if (token && user) {
      set({ token, user, isAuthenticated: true, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },
}))
