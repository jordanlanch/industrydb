import { z } from 'zod';

/**
 * Zod validation schemas for all forms in IndustryDB
 *
 * These schemas provide client-side validation with clear error messages
 * and type safety throughout the application.
 */

// ============================================================================
// Authentication Schemas
// ============================================================================

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept the Terms of Service and Privacy Policy',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// User Profile Schemas
// ============================================================================

/**
 * Update profile form validation schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim()
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Change password form validation schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Delete account form validation schema
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete your account'),
  confirmation: z
    .string()
    .min(1, 'Please type DELETE to confirm')
    .refine((val) => val === 'DELETE', {
      message: 'Please type DELETE in capital letters to confirm',
    }),
});

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

// ============================================================================
// Lead Search Schemas
// ============================================================================

/**
 * Lead search filters validation schema
 */
export const leadSearchFiltersSchema = z.object({
  industry: z
    .string()
    .min(1, 'Please select an industry')
    .refine(
      (val) => [
        'tattoo', 'beauty', 'barber', 'nail_salon', 'spa', 'massage',
        'gym', 'dentist', 'pharmacy',
        'restaurant', 'cafe', 'bar', 'bakery',
        'car_repair', 'car_wash', 'car_dealer',
        'lawyer', 'accountant',
        'clothing', 'convenience'
      ].includes(val),
      'Invalid industry selected'
    ),
  country: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z]{2}$/.test(val),
      'Country code must be 2 uppercase letters (e.g., US, GB, ES)'
    ),
  city: z
    .string()
    .max(100, 'City name must be less than 100 characters')
    .trim()
    .optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  hasWebsite: z.boolean().optional(),
  minQualityScore: z
    .number()
    .min(0, 'Quality score must be at least 0')
    .max(100, 'Quality score cannot exceed 100')
    .optional(),
  page: z.number().min(1, 'Page must be at least 1').optional().default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(50),
});

export type LeadSearchFiltersFormData = z.infer<typeof leadSearchFiltersSchema>;

/**
 * Export leads form validation schema
 */
export const exportLeadsSchema = z.object({
  format: z.enum(['csv', 'excel'], {
    errorMap: () => ({ message: 'Please select a valid export format' }),
  }),
  filters: leadSearchFiltersSchema,
});

export type ExportLeadsFormData = z.infer<typeof exportLeadsSchema>;

// ============================================================================
// Saved Search Schemas
// ============================================================================

/**
 * Save search form validation schema
 */
export const saveSearchSchema = z.object({
  name: z
    .string()
    .min(1, 'Search name is required')
    .min(3, 'Search name must be at least 3 characters')
    .max(100, 'Search name must be less than 100 characters')
    .trim(),
  filters: leadSearchFiltersSchema,
  notifications: z.boolean().optional().default(false),
});

export type SaveSearchFormData = z.infer<typeof saveSearchSchema>;

// ============================================================================
// API Key Schemas
// ============================================================================

/**
 * Create API key form validation schema
 */
export const createAPIKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  expiresAt: z
    .date()
    .min(new Date(), 'Expiration date must be in the future')
    .optional(),
});

export type CreateAPIKeyFormData = z.infer<typeof createAPIKeySchema>;

// ============================================================================
// Organization Schemas
// ============================================================================

/**
 * Create organization form validation schema
 */
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
});

export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;

/**
 * Invite member form validation schema
 */
export const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  role: z.enum(['member', 'admin'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

// ============================================================================
// Contact Form Schemas
// ============================================================================

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters')
    .trim(),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format Zod validation errors into a user-friendly format
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });

  return formatted;
}

/**
 * Validate form data and return errors or null
 */
export function validateForm<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: formatZodError(result.error) };
}
