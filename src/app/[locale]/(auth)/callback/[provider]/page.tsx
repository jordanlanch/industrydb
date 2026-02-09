'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  invalid_state: 'invalidState',
  oauth_failed: 'oauthFailed',
  account_exists: 'accountExists',
  access_denied: 'accessDenied',
}

export default function OAuthCallbackPage() {
  const t = useTranslations('auth.oauthCallback')
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      const messageKey = ERROR_MESSAGES[errorParam] || 'genericError'
      setError(t(messageKey))
      return
    }

    if (!token) {
      setError(t('genericError'))
      return
    }

    async function handleCallback(jwt: string) {
      try {
        const user = await authService.getCurrentUser(jwt)
        login(jwt, user)
        router.push('/dashboard')
      } catch {
        setError(t('genericError'))
      }
    }

    handleCallback(token)
  }, [searchParams, login, router, t])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
              {t('error')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              {t('backToLogin')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <CardTitle className="text-2xl font-bold">{t('signingIn')}</CardTitle>
          <CardDescription>{t('signingInDescription')}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
