'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

// Zod validation schema
const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  acceptedTerms: z.boolean()
    .refine((val) => val === true, {
      message: 'You must accept the Terms of Service and Privacy Policy',
    }),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string || 'en'
  const login = useAuthStore((state) => state.login)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      name: '',
      email: '',
      password: '',
      acceptedTerms: false,
    },
  })

  // Watch fields for button state and password validation
  const name = watch('name')
  const email = watch('email')
  const password = watch('password')
  const acceptedTerms = watch('acceptedTerms')

  const isFormFilled = name.length >= 2 &&
                       email.length > 0 &&
                       password.length >= 8 &&
                       acceptedTerms === true

  const onSubmit = async (data: RegisterForm) => {
    setApiError('')
    setLoading(true)

    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      login(response.token, response.user)

      router.push(`/${locale}/dashboard`)
    } catch (err: any) {
      setApiError(err.response?.data?.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicators
  const passwordChecks = {
    length: password ? password.length >= 8 : false,
    uppercase: password ? /[A-Z]/.test(password) : false,
    lowercase: password ? /[a-z]/.test(password) : false,
    number: password ? /[0-9]/.test(password) : false,
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>
            {t('subtitle')}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* API Error Display */}
            {apiError && (
              <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t('namePlaceholder')}
                disabled={loading}
                {...register('name')}
                aria-invalid={!!errors.name}
                aria-required="true"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                disabled={loading}
                {...register('email')}
                aria-invalid={!!errors.email}
                aria-required="true"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                disabled={loading}
                {...register('password')}
                aria-invalid={!!errors.password}
                aria-required="true"
                aria-describedby="password-requirements"
              />

              {/* Password Requirements */}
              <div id="password-requirements" className="space-y-1 text-xs">
                <p className="text-muted-foreground mb-1">{t('passwordRequirements')}</p>
                <div className="space-y-1 pl-2">
                  <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordChecks.length ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-current" />
                    )}
                    <span>{t('requirementLength')}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordChecks.uppercase ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-current" />
                    )}
                    <span>{t('requirementUppercase')}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordChecks.lowercase ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-current" />
                    )}
                    <span>{t('requirementLowercase')}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordChecks.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordChecks.number ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-current" />
                    )}
                    <span>{t('requirementNumber')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Acceptance */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                disabled={loading}
                {...register('acceptedTerms')}
                aria-invalid={!!errors.acceptedTerms}
                aria-required="true"
                aria-describedby={errors.acceptedTerms ? 'terms-error' : undefined}
              />
              <div className="flex-1">
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('agreeToTermsPrefix')}{' '}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('terms')}
                  </Link>{' '}
                  {t('agreeToTermsAnd')}{' '}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('privacy')}
                  </Link>
                </label>
                {errors.acceptedTerms && (
                  <p id="terms-error" className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.acceptedTerms.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isFormFilled}
            >
              {loading ? t('submitting') : t('submit')}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t('signIn')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
