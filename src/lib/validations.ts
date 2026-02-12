import { z } from 'zod'

// Translation function type
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string

// Default translation function with English fallbacks
const defaultT: TranslationFunction = (key, params) => {
  const defaults: Record<string, string> = {
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    passwordMinLength: `Password must be at least ${params?.min || 6} characters`,
    passwordPattern: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    nameRequired: 'Name is required',
    nameMinLength: `Name must be at least ${params?.min || 2} characters`,
    acceptTerms: 'You must accept the terms and conditions',
    currentPasswordRequired: 'Current password is required',
    newPasswordRequired: 'New password is required',
    confirmPasswordRequired: 'Please confirm your new password',
    passwordsMismatch: 'Passwords do not match',
    apiKeyNameRequired: 'Name is required',
    apiKeyNameMinLength: `Name must be at least ${params?.min || 3} characters`,
    apiKeyNameMaxLength: `Name must be less than ${params?.max || 100} characters`,
    savedSearchNameRequired: 'Name is required',
    savedSearchNameMinLength: `Name must be at least ${params?.min || 3} characters`,
    savedSearchNameMaxLength: `Name must be less than ${params?.max || 100} characters`,
    savedSearchDescMaxLength: `Description must be less than ${params?.max || 500} characters`,
  }
  return defaults[key] || key
}

// ============================================
// LOGIN SCHEMA
// ============================================

export const createLoginSchema = (t: TranslationFunction) => z.object({
  email: z
    .string()
    .min(1, t('emailRequired'))
    .email(t('emailInvalid')),
  password: z
    .string()
    .min(1, t('passwordRequired'))
    .min(6, t('passwordMinLength', { min: 6 })),
})

export const loginSchema = createLoginSchema(defaultT)
export type LoginFormData = z.infer<typeof loginSchema>

// ============================================
// REGISTER SCHEMA
// ============================================

export const createRegisterSchema = (t: TranslationFunction) => z.object({
  name: z
    .string()
    .min(1, t('nameRequired'))
    .min(2, t('nameMinLength', { min: 2 })),
  email: z
    .string()
    .min(1, t('emailRequired'))
    .email(t('emailInvalid')),
  password: z
    .string()
    .min(1, t('passwordRequired'))
    .min(8, t('passwordMinLength', { min: 8 }))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      t('passwordPattern')
    ),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, t('acceptTerms')),
})

export const registerSchema = createRegisterSchema(defaultT)
export type RegisterFormData = z.infer<typeof registerSchema>

// ============================================
// PROFILE SCHEMA
// ============================================

export const createProfileSchema = (t: TranslationFunction) => z.object({
  name: z
    .string()
    .min(1, t('nameRequired'))
    .min(2, t('nameMinLength', { min: 2 })),
  email: z
    .string()
    .min(1, t('emailRequired'))
    .email(t('emailInvalid')),
})

export const profileSchema = createProfileSchema(defaultT)
export type ProfileFormData = z.infer<typeof profileSchema>

// ============================================
// PASSWORD CHANGE SCHEMA
// ============================================

export const createPasswordChangeSchema = (t: TranslationFunction) => z.object({
  currentPassword: z
    .string()
    .min(1, t('currentPasswordRequired')),
  newPassword: z
    .string()
    .min(1, t('newPasswordRequired'))
    .min(8, t('passwordMinLength', { min: 8 }))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      t('passwordPattern')
    ),
  confirmPassword: z
    .string()
    .min(1, t('confirmPasswordRequired')),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: defaultT('passwordsMismatch'),
  path: ['confirmPassword'],
})

export const passwordChangeSchema = createPasswordChangeSchema(defaultT)
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

// ============================================
// API KEY SCHEMA
// ============================================

export const createApiKeySchema = (t: TranslationFunction) => z.object({
  name: z
    .string()
    .min(1, t('apiKeyNameRequired'))
    .min(3, t('apiKeyNameMinLength', { min: 3 }))
    .max(100, t('apiKeyNameMaxLength', { max: 100 })),
  expiresAt: z
    .string()
    .optional(),
})

export const apiKeySchema = createApiKeySchema(defaultT)
export type ApiKeyFormData = z.infer<typeof apiKeySchema>

// ============================================
// SAVED SEARCH SCHEMA
// ============================================

export const createSavedSearchSchema = (t: TranslationFunction) => z.object({
  name: z
    .string()
    .min(1, t('savedSearchNameRequired'))
    .min(3, t('savedSearchNameMinLength', { min: 3 }))
    .max(100, t('savedSearchNameMaxLength', { max: 100 })),
  description: z
    .string()
    .max(500, t('savedSearchDescMaxLength', { max: 500 }))
    .optional(),
  notifyOnNewResults: z
    .boolean()
    .default(false),
})

export const savedSearchSchema = createSavedSearchSchema(defaultT)
export type SavedSearchFormData = z.infer<typeof savedSearchSchema>
