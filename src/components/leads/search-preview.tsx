'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Mail, Phone, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import type { LeadPreviewResponse } from '@/types'

interface SearchPreviewProps {
  preview: LeadPreviewResponse | null
  loading: boolean
  error: string | null
  hasFilters: boolean
}

export function SearchPreview({ preview, loading, error, hasFilters }: SearchPreviewProps) {
  // Don't show anything if no filters are selected
  if (!hasFilters && !loading) {
    return null
  }

  // Loading state
  if (loading) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading preview...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load preview</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No preview data
  if (!preview) {
    return null
  }

  // No results
  if (preview.estimated_count === 0) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-yellow-700">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">No results found</span>
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            Try adjusting your filters to see more results
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate contact info percentage (email OR phone OR website)
  const contactInfoPct = Math.max(
    preview.with_email_pct,
    preview.with_phone_pct,
    preview.verified_pct
  )

  // Show preview with simplified statistics
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="py-3 space-y-2">
        {/* Main count and contact info percentage */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            {preview.estimated_count.toLocaleString()} leads found
          </span>
          <Badge variant="secondary" className="text-xs">
            {Math.round(contactInfoPct)}% contact info
          </Badge>
        </div>

        {/* Quality score (optional, only if good quality) */}
        {preview.quality_score_avg >= 50 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" />
            <span>Avg quality: {preview.quality_score_avg.toFixed(0)}/100</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
