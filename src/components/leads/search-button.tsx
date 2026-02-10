'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import type { UsageInfo } from '@/types'

interface SearchButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
  usage: UsageInfo | null
  hasFilters: boolean
}

export function SearchButton({ onClick, loading, disabled, usage, hasFilters }: SearchButtonProps) {
  const isOutOfCredits = usage && usage.remaining === 0
  const isLowCredits = usage && usage.remaining > 0 && usage.remaining <= 10

  // Determine button variant based on credit status
  const getButtonVariant = () => {
    if (isOutOfCredits) return 'destructive'
    if (isLowCredits) return 'default'
    return 'default'
  }

  // Determine button text
  const getButtonText = () => {
    if (loading) return 'Searching...'
    if (isOutOfCredits) return 'No Credits Remaining'
    return 'Search Leads'
  }

  // Determine tooltip text
  const getTooltipText = () => {
    if (!hasFilters) return 'Select at least one filter to search'
    if (isOutOfCredits) return 'Upgrade your plan to continue searching'
    if (isLowCredits) return `⚠️ Only ${usage?.remaining} searches left this month`
    return 'Search for leads matching your filters'
  }

  return (
    <div className="space-y-2">
      {/* Search Button */}
      <Button
        onClick={onClick}
        disabled={disabled || isOutOfCredits || !hasFilters || loading}
        variant={getButtonVariant()}
        size="default"
        className="w-full"
        title={getTooltipText()}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            {isOutOfCredits ? 'No Credits' : 'Search'}
            {usage && usage.remaining > 0 && !isOutOfCredits && (
              <Badge variant="secondary" className="ml-auto">
                {usage.remaining}/{usage.usage_limit}
              </Badge>
            )}
          </>
        )}
      </Button>

      {/* Compact warnings */}
      {isOutOfCredits && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Out of credits.{' '}
          <a href="/dashboard/settings?tab=billing" className="underline font-medium">
            Upgrade
          </a>
        </p>
      )}

      {isLowCredits && !isOutOfCredits && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Low credits ({usage?.remaining} left)
        </p>
      )}

      {!hasFilters && (
        <p className="text-xs text-muted-foreground text-center">
          Select filters to search
        </p>
      )}
    </div>
  )
}
