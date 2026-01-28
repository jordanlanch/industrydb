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
    <div className="space-y-3">
      {/* Credit Warning Banner */}
      {isLowCredits && !isOutOfCredits && (
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-700">
            <p className="font-semibold">Low on credits!</p>
            <p>You have <strong>{usage?.remaining}</strong> searches remaining this month.</p>
          </div>
        </div>
      )}

      {/* Out of Credits Banner */}
      {isOutOfCredits && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-700">
            <p className="font-semibold">Usage limit reached</p>
            <p>Upgrade your plan to continue searching for leads.</p>
            <Button
              variant="default"
              size="sm"
              className="mt-2 w-full"
              onClick={() => window.location.href = '/dashboard/settings/billing'}
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Search Button */}
      <Button
        onClick={onClick}
        disabled={disabled || isOutOfCredits || !hasFilters || loading}
        variant={getButtonVariant()}
        size="lg"
        className="w-full"
        title={getTooltipText()}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            {getButtonText()}
          </>
        ) : (
          <>
            <Search className="h-5 w-5 mr-2" />
            {getButtonText()}
            {usage && usage.remaining > 0 && !isOutOfCredits && (
              <Badge variant="secondary" className="ml-2">
                1 credit
              </Badge>
            )}
          </>
        )}
      </Button>

      {/* Credit Counter */}
      {usage && usage.remaining > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          <span className="font-medium">{usage.remaining}</span> of <span className="font-medium">{usage.usage_limit}</span> searches remaining
          {usage.reset_at && (
            <span className="block mt-1">
              Resets {new Date(usage.reset_at).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* No Filters Warning */}
      {!hasFilters && (
        <div className="text-center text-xs text-muted-foreground">
          Select filters above to start searching
        </div>
      )}
    </div>
  )
}
