/**
 * Lead Card Component
 * Enhanced card display with sub-niche badges, specialty tags, and quality indicators
 */
'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { SubNicheBadge, SubNicheBadgeCompact } from './sub-niche-badge'
import { QualityBadge } from './quality-badge'
import { QualityProgressBar } from './quality-progress-bar'
import { FieldPresenceIcons } from './field-presence-icons'
import { CompletenessIndicator } from './completeness-indicator'
import type { Lead } from '@/types'
import { MapPin, Phone, Mail, Globe, Copy, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadCardProps {
  lead: Lead
  onCopyText?: (text: string, label: string) => void
  variant?: 'default' | 'compact'
  className?: string
}

export const LeadCard = React.memo(function LeadCard({
  lead,
  onCopyText,
  variant = 'default',
  className,
}: LeadCardProps) {
  const handleCopy = (text: string, label: string) => {
    if (onCopyText) {
      onCopyText(text, label)
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  // Get sub-niche name (prioritize specific type over generic sub_niche)
  const getSubNicheName = () => {
    if (lead.cuisine_type) return lead.cuisine_type
    if (lead.sport_type) return lead.sport_type
    if (lead.tattoo_style) return lead.tattoo_style
    return lead.sub_niche
  }

  const subNicheName = getSubNicheName()

  // Format sub-niche for display (capitalize, replace underscores)
  const formatSubNiche = (name?: string) => {
    if (!name) return null
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'border rounded-lg p-3 hover:bg-gray-50 transition-colors',
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-base truncate">{lead.name}</h3>
              {lead.verified && (
                <Badge variant="default" className="text-xs">Verified</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {subNicheName ? (
                <SubNicheBadge
                  industryId={lead.industry}
                  industryName={lead.industry}
                  subNicheName={formatSubNiche(subNicheName) || undefined}
                  size="sm"
                  showIcon={true}
                />
              ) : (
                <Badge variant="secondary" className="text-xs">{lead.industry}</Badge>
              )}
              <QualityBadge score={lead.quality_score} size="sm" />
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {lead.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {lead.city}, {lead.country}
                </div>
              )}
              <FieldPresenceIcons lead={lead} size="sm" />
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-medium text-muted-foreground">Quality</div>
            <div className="text-xl font-bold text-primary">{lead.quality_score}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'border rounded-lg p-4 hover:bg-gray-50 transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header: Name + Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <h3 className="font-semibold text-lg">{lead.name}</h3>
            {lead.verified && (
              <Badge variant="default">Verified</Badge>
            )}
            {subNicheName ? (
              <SubNicheBadge
                industryId={lead.industry}
                industryName={lead.industry}
                subNicheName={formatSubNiche(subNicheName) || undefined}
                size="md"
                showIcon={true}
              />
            ) : (
              <Badge variant="secondary">{lead.industry}</Badge>
            )}
            <QualityBadge score={lead.quality_score} />
          </div>

          {/* Specialty Tags */}
          {lead.specialties && lead.specialties.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {lead.specialties.slice(0, 5).map((specialty, idx) => (
                  <SubNicheBadgeCompact
                    key={idx}
                    subNicheName={specialty}
                    size="sm"
                    variant="outline"
                  />
                ))}
                {lead.specialties.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{lead.specialties.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
            {lead.city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {lead.city}, {lead.country}
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>{lead.phone}</span>
                <button
                  onClick={() => handleCopy(lead.phone!, 'Phone')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy phone number"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span className="truncate">{lead.email}</span>
                <button
                  onClick={() => handleCopy(lead.email!, 'Email')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy email"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
            {lead.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  {lead.website.replace(/^https?:\/\//, '').slice(0, 30)}
                </a>
              </div>
            )}
          </div>

          {/* Quality Indicators */}
          <div className="flex items-center gap-4 mt-3">
            <QualityProgressBar score={lead.quality_score} className="flex-1 max-w-xs" />
            <FieldPresenceIcons lead={lead} />
          </div>

          <CompletenessIndicator lead={lead} className="mt-2" />
        </div>

        {/* Quality Score Display */}
        <div className="text-right ml-4">
          <div className="text-sm font-medium text-muted-foreground">Quality</div>
          <div className="text-2xl font-bold text-primary">{lead.quality_score}</div>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if lead data actually changed
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.quality_score === nextProps.lead.quality_score &&
    prevProps.lead.verified === nextProps.lead.verified &&
    prevProps.variant === nextProps.variant
  )
})

// Group header component for grouped views
export function LeadGroupHeader({
  title,
  count,
  icon,
}: {
  title: string
  count: number
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-gray-100 border-b sticky top-0 z-10">
      {icon}
      <h3 className="font-semibold text-base">{title}</h3>
      <Badge variant="secondary">{count}</Badge>
    </div>
  )
}
