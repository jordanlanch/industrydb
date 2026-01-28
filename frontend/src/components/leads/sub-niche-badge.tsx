/**
 * Sub-Niche Badge Component
 * Displays industry sub-niche with professional styling
 */
'use client'

import { Badge } from '@/components/ui/badge'
import { IndustryIcon } from '@/components/industry-icon'
import { cn } from '@/lib/utils'

interface SubNicheBadgeProps {
  industryId: string
  industryName: string
  subNicheName?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'secondary'
  showIcon?: boolean
  className?: string
}

export function SubNicheBadge({
  industryId,
  industryName,
  subNicheName,
  size = 'md',
  variant = 'secondary',
  showIcon = true,
  className,
}: SubNicheBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  }

  const displayText = subNicheName ? `${subNicheName}` : industryName

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-1.5',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <IndustryIcon
          industryId={industryId}
          size={iconSizes[size]}
        />
      )}
      <span>{displayText}</span>
      {subNicheName && (
        <span className="text-muted-foreground text-xs ml-0.5">
          · {industryName}
        </span>
      )}
    </Badge>
  )
}

// Compact version showing just sub-niche
export function SubNicheBadgeCompact({
  subNicheName,
  size = 'sm',
  variant = 'outline',
  className,
}: {
  subNicheName: string
  size?: 'sm' | 'md'
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  return (
    <Badge
      variant={variant}
      className={cn('inline-flex items-center', sizeClasses[size], className)}
    >
      {subNicheName}
    </Badge>
  )
}
