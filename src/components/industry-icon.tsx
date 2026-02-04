/**
 * IndustryIcon Component
 * Professional icon display for industries and categories
 */
import React from 'react'
import { cn } from '@/lib/utils'
import { getIndustryIcon, getCategoryIcon, getCategoryColors, type LucideIcon } from '@/lib/industry-icons'

interface IndustryIconProps {
  /** Industry ID (e.g., 'restaurant', 'gym') */
  industryId?: string
  /** Category ID (e.g., 'food_beverage', 'health_wellness') */
  categoryId?: string
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Custom className */
  className?: string
  /** Show colored background */
  showBackground?: boolean
  /** Custom icon (overrides industryId/categoryId) */
  icon?: LucideIcon
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
}

export function IndustryIcon({
  industryId,
  categoryId,
  size = 'md',
  className,
  showBackground = false,
  icon,
}: IndustryIconProps) {
  // Determine which icon to use
  let IconComponent = icon
  let colors = null

  if (!IconComponent) {
    if (industryId) {
      IconComponent = getIndustryIcon(industryId)
      // Try to infer category from industry (for color)
      // This is a simplified mapping - in real app, fetch from API
      const industryToCategory: Record<string, string> = {
        restaurant: 'food_beverage',
        cafe: 'food_beverage',
        bar: 'food_beverage',
        bakery: 'food_beverage',
        tattoo: 'personal_care',
        beauty: 'personal_care',
        barber: 'personal_care',
        spa: 'personal_care',
        nail_salon: 'personal_care',
        gym: 'health_wellness',
        dentist: 'health_wellness',
        pharmacy: 'health_wellness',
        massage: 'health_wellness',
        car_repair: 'automotive',
        car_wash: 'automotive',
        car_dealer: 'automotive',
        clothing: 'retail',
        convenience: 'retail',
        lawyer: 'professional',
        accountant: 'professional',
      }
      const inferredCategory = industryToCategory[industryId]
      if (inferredCategory) {
        colors = getCategoryColors(inferredCategory)
      }
    } else if (categoryId) {
      IconComponent = getCategoryIcon(categoryId)
      colors = getCategoryColors(categoryId)
    }
  }

  if (!IconComponent) {
    return null
  }

  const iconClasses = cn(
    sizeMap[size],
    colors?.text || 'text-gray-600',
    className
  )

  if (showBackground && colors) {
    return (
      <div className={cn(
        'inline-flex items-center justify-center rounded-lg p-2',
        colors.bg,
        colors.border,
        'border'
      )}>
        <IconComponent className={iconClasses} />
      </div>
    )
  }

  return <IconComponent className={iconClasses} />
}

/**
 * IndustryBadge Component
 * Displays industry with icon and name
 */
interface IndustryBadgeProps {
  industryId: string
  industryName: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'solid'
  className?: string
}

export function IndustryBadge({
  industryId,
  industryName,
  size = 'md',
  variant = 'default',
  className,
}: IndustryBadgeProps) {
  const IconComponent = getIndustryIcon(industryId)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  }

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    outline: 'bg-white text-gray-700 border border-gray-300',
    solid: 'bg-gray-700 text-white border border-gray-700',
  }

  const iconSizes = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  }

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <IndustryIcon industryId={industryId} size={iconSizes[size]} />
      <span>{industryName}</span>
    </div>
  )
}

/**
 * CategoryBadge Component
 * Displays category with icon and name (with category colors)
 */
interface CategoryBadgeProps {
  categoryId: string
  categoryName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CategoryBadge({
  categoryId,
  categoryName,
  size = 'md',
  className,
}: CategoryBadgeProps) {
  const colors = getCategoryColors(categoryId)
  const IconComponent = getCategoryIcon(categoryId)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  }

  const iconSizes = {
    sm: 'xs' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  }

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium border',
      sizeClasses[size],
      colors.bg,
      colors.text,
      colors.border,
      className
    )}>
      <IconComponent className={cn(
        iconSizes[size] === 'xs' ? 'h-3 w-3' : iconSizes[size] === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
      )} />
      <span>{categoryName}</span>
    </div>
  )
}
