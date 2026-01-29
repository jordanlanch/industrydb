'use client'

import { Label } from '@/components/ui/label'
import { type LucideIcon } from 'lucide-react'

interface FilterSectionProps {
  icon: LucideIcon
  label: string
  required?: boolean
  children: React.ReactNode
}

/**
 * Reusable wrapper for filter sections
 * Provides consistent styling and structure
 */
export function FilterSection({
  icon: Icon,
  label,
  required,
  children,
}: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
        {required && (
          <span className="text-xs text-destructive ml-1">(required)</span>
        )}
      </Label>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
