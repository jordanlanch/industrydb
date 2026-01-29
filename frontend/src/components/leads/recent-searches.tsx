'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, X, Trash2 } from 'lucide-react'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import type { LeadSearchRequest } from '@/types'
import { useTranslations } from 'next-intl'

interface RecentSearchesProps {
  onApplySearch: (filters: LeadSearchRequest) => void
  getCountryName?: (code: string) => string
  getIndustryName?: (code: string) => string
}

/**
 * Display and manage recent search history
 */
export function RecentSearches({
  onApplySearch,
  getCountryName = (code) => code,
  getIndustryName = (code) => code,
}: RecentSearchesProps) {
  const t = useTranslations('leads')
  const { searches, removeSearch, clearAll, isLoaded } = useRecentSearches()

  if (!isLoaded || searches.length === 0) return null

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('filters.recentSearches')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8 w-8 p-0"
            title="Clear all"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {searches.map((search) => (
          <div
            key={search.id}
            className="flex items-center justify-between gap-2 group"
          >
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start h-auto py-2 px-2"
              onClick={() => onApplySearch(search.filters)}
            >
              <div className="flex flex-col items-start w-full">
                <span className="text-xs font-medium truncate w-full">
                  {formatSearchName(search.filters, getIndustryName, getCountryName)}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px] h-4">
                    {search.resultCount.toLocaleString()}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimestamp(search.timestamp)}
                  </span>
                </div>
              </div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSearch(search.id)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              title="Remove"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function formatSearchName(
  filters: LeadSearchRequest,
  getIndustryName: (code: string) => string,
  getCountryName: (code: string) => string
): string {
  const parts: string[] = []

  if (filters.industry) {
    parts.push(getIndustryName(filters.industry))
  }

  if (filters.country) {
    parts.push(`in ${getCountryName(filters.country)}`)
  }

  if (filters.city) {
    parts.push(filters.city)
  }

  if (filters.has_email) {
    parts.push('with email')
  }

  if (filters.has_phone) {
    parts.push('with phone')
  }

  return parts.length > 0 ? parts.join(' ') : 'All leads'
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}
