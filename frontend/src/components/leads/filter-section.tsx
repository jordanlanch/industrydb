'use client'

import { Label } from '@/components/ui/label'
import { type LucideIcon } from 'lucide-react'

interface FilterSectionProps {
  icon: LucideIcon
  label: string
  required?: boolean
  helpText?: string
  children: React.ReactNode
  variant?: 'default' | 'compact'
}

/**
 * Reusable wrapper for filter sections
 * Provides consistent styling and structure
 */
export function FilterSection({
  icon: Icon,
  label,
  required,
  helpText,
  children,
  variant = 'default',
}: FilterSectionProps) {
  const spacing = variant === 'compact' ? 'space-y-2' : 'space-y-3'
  const iconSize = variant === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const textSize = variant === 'compact' ? 'text-xs' : 'text-sm'

  return (
    <div className={spacing}>
      <div>
        <Label className={`${textSize} font-semibold flex items-center gap-2`}>
          <Icon className={`${iconSize} text-muted-foreground`} />
          {label}
          {required && (
            <span className="text-xs text-destructive ml-1">(required)</span>
          )}
        </Label>
        {helpText && (
          <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
