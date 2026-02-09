export type OAuthProvider = 'google' | 'github'

interface OAuthProviderConfig {
  name: string
  scope: string[]
}

export const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
  google: {
    name: 'Google',
    scope: ['email', 'profile'],
  },
  github: {
    name: 'GitHub',
    scope: ['user:email'],
  },
}

export function getOAuthUrl(provider: OAuthProvider): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7890/api/v1'
  return `${apiUrl}/auth/oauth/${provider}`
}

export function initiateOAuth(provider: OAuthProvider): void {
  window.location.href = getOAuthUrl(provider)
}
