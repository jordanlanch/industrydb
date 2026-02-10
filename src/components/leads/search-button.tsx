'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { UsageInfo } from '@/types'

interface SearchButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
  usage: UsageInfo | null
  hasFilters: boolean
}

export function SearchButton({ onClick, loading, disabled, usage, hasFilters }: SearchButtonProps) {
  const t = useTranslations('leads.search')
  const isOutOfCredits = usage && usage.remaining === 0
  const isLowCredits = usage && usage.remaining > 0 && usage.remaining <= 10

  // Determine button variant based on credit status
  const getButtonVariant = () => {
    if (isOutOfCredits) return 'destructive'
    return 'default'
  }

  // Determine tooltip text
  const getTooltipText = () => {
    if (!hasFilters) return t('selectFilters')
    if (isOutOfCredits) return t('upgradeToSearch')
    if (isLowCredits) return t('onlyLeft', { remaining: usage?.remaining })
    return t('matchingFilters')
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
            {t('searching')}
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            {isOutOfCredits ? t('noCredits') : t('searchLeads')}
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
          {t('outOfCredits')}{' '}
          <a href="/dashboard/settings?tab=billing" className="underline font-medium">
            {t('upgrade')}
          </a>
        </p>
      )}

      {isLowCredits && !isOutOfCredits && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {t('lowCredits', { remaining: usage?.remaining })}
        </p>
      )}

      {!hasFilters && (
        <p className="text-xs text-muted-foreground text-center">
          {t('selectFilters')}
        </p>
      )}
    </div>
  )
}
