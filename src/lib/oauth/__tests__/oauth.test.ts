import { getOAuthUrl, OAUTH_PROVIDERS, type OAuthProvider } from '../index'

describe('OAuth Utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('OAUTH_PROVIDERS', () => {
    it('exports google provider config', () => {
      expect(OAUTH_PROVIDERS.google).toBeDefined()
      expect(OAUTH_PROVIDERS.google.name).toBe('Google')
      expect(OAUTH_PROVIDERS.google.scope).toContain('email')
      expect(OAUTH_PROVIDERS.google.scope).toContain('profile')
    })

    it('exports github provider config', () => {
      expect(OAUTH_PROVIDERS.github).toBeDefined()
      expect(OAUTH_PROVIDERS.github.name).toBe('GitHub')
      expect(OAUTH_PROVIDERS.github.scope).toContain('user:email')
    })
  })

  describe('getOAuthUrl', () => {
    it('returns the backend OAuth URL for google provider', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:7890/api/v1'
      const url = getOAuthUrl('google')
      expect(url).toBe('http://localhost:7890/api/v1/auth/oauth/google')
    })

    it('returns the backend OAuth URL for github provider', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:7890/api/v1'
      const url = getOAuthUrl('github')
      expect(url).toBe('http://localhost:7890/api/v1/auth/oauth/github')
    })

    it('uses default API URL when env var is not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL
      const url = getOAuthUrl('google')
      expect(url).toBe('http://localhost:7890/api/v1/auth/oauth/google')
    })

    it('handles production API URL', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.industrydb.io/api/v1'
      const url = getOAuthUrl('google')
      expect(url).toBe('https://api.industrydb.io/api/v1/auth/oauth/google')
    })
  })

  describe('OAuthProvider type', () => {
    it('accepts valid provider types', () => {
      const google: OAuthProvider = 'google'
      const github: OAuthProvider = 'github'
      expect(google).toBe('google')
      expect(github).toBe('github')
    })
  })
})
