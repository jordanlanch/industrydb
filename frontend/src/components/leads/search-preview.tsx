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

  // Show preview with statistics
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4 space-y-3">
        {/* Estimated Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Estimated Results</span>
          </div>
          <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
            {preview.estimated_count.toLocaleString()} leads
          </Badge>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Email */}
          <div className="flex flex-col items-center p-2 bg-white/60 rounded">
            <Mail className="h-3 w-3 text-blue-600 mb-1" />
            <span className="font-semibold text-blue-900">{Math.round(preview.with_email_pct)}%</span>
            <span className="text-blue-700">Email</span>
          </div>

          {/* Phone */}
          <div className="flex flex-col items-center p-2 bg-white/60 rounded">
            <Phone className="h-3 w-3 text-blue-600 mb-1" />
            <span className="font-semibold text-blue-900">{Math.round(preview.with_phone_pct)}%</span>
            <span className="text-blue-700">Phone</span>
          </div>

          {/* Verified */}
          <div className="flex flex-col items-center p-2 bg-white/60 rounded">
            <CheckCircle2 className="h-3 w-3 text-blue-600 mb-1" />
            <span className="font-semibold text-blue-900">{Math.round(preview.verified_pct)}%</span>
            <span className="text-blue-700">Verified</span>
          </div>
        </div>

        {/* Quality Score */}
        <div className="flex items-center justify-between text-xs bg-white/60 p-2 rounded">
          <span className="text-blue-700">Avg Quality Score</span>
          <Badge variant="outline" className="border-blue-300 text-blue-900">
            {preview.quality_score_avg.toFixed(1)}/100
          </Badge>
        </div>

        {/* Info message */}
        <p className="text-xs text-blue-600 text-center pt-1">
          Preview doesn't consume credits
        </p>
      </CardContent>
    </Card>
  )
}
