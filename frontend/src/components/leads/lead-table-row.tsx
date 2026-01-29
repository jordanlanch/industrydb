import React from 'react'
import type { Lead } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QualityBadge } from './quality-badge'
import { MapPin, Phone, Mail, Globe, Copy, ExternalLink } from 'lucide-react'

interface LeadTableRowProps {
  lead: Lead
  onCopyEmail?: (email: string) => void
  onCopyPhone?: (phone: string) => void
}

export const LeadTableRow = React.memo(function LeadTableRow({ lead, onCopyEmail, onCopyPhone }: LeadTableRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div>
          <div className="font-semibold">{lead.name}</div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {lead.city}, {lead.country}
            </span>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          <Badge variant="secondary" className="text-xs">
            {lead.industry}
          </Badge>
          {lead.verified && (
            <Badge variant="default" className="text-xs">
              Verified
            </Badge>
          )}
        </div>
      </td>
      <td className="p-4">
        {lead.email ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span className="truncate max-w-[200px]">{lead.email}</span>
            </div>
            {onCopyEmail && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyEmail(lead.email!)}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>
      <td className="p-4">
        {lead.phone ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{lead.phone}</span>
            </div>
            {onCopyPhone && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyPhone(lead.phone!)}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>
      <td className="p-4">
        {lead.website ? (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Globe className="h-3 w-3" />
            <span className="truncate max-w-[150px]">Visit</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>
      <td className="p-4 text-center">
        <QualityBadge score={lead.quality_score} showScore={false} />
        <div className="text-xs text-muted-foreground mt-1">{lead.quality_score}</div>
      </td>
    </tr>
  )
}, (prevProps, nextProps) => {
  // Only re-render if lead data changed
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.quality_score === nextProps.lead.quality_score &&
    prevProps.lead.email === nextProps.lead.email &&
    prevProps.lead.phone === nextProps.lead.phone
  )
})
