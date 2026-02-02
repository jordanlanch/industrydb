'use client';

import { InputHTMLAttributes } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  /** Field label text */
  label: string;
  /** Field name (matches react-hook-form field) */
  name: string;
  /** Input type (text, email, password, number, etc.) */
  type?: string;
  /** Error message to display */
  error?: string;
  /** React Hook Form register return value */
  register?: UseFormRegisterReturn;
  /** Placeholder text */
  placeholder?: string;
  /** Whether field is required */
  required?: boolean;
  /** Additional CSS classes for input */
  className?: string;
  /** Help text to display below input */
  helpText?: string;
  /** Whether input is disabled */
  disabled?: boolean;
}

/**
 * Reusable form field component with label, error display, and accessible markup.
 *
 * @example
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import { FormField } from '@/components/form-field';
 *
 * function MyForm() {
 *   const { register, formState: { errors } } = useForm();
 *
 *   return (
 *     <form>
 *       <FormField
 *         label="Email Address"
 *         name="email"
 *         type="email"
 *         placeholder="Enter your email"
 *         required
 *         error={errors.email?.message}
 *         register={register('email')}
 *       />
 *     </form>
 *   );
 * }
 * ```
 */
export function FormField({
  label,
  name,
  type = 'text',
  error,
  register,
  placeholder,
  required = false,
  className = '',
  helpText,
  disabled = false,
  ...props
}: FormFieldProps) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helpTextId = `${fieldId}-help`;

  return (
    <div className="space-y-2">
      {/* Label */}
      <Label
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>

      {/* Input */}
      <Input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? errorId : helpText ? helpTextId : undefined
        }
        className={`${className} ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        {...register}
        {...props}
      />

      {/* Help Text */}
      {helpText && !error && (
        <p
          id={helpTextId}
          className="text-sm text-muted-foreground"
        >
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-destructive"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
