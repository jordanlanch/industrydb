import type { Lead } from '@/types'
import { Mail, Phone, Globe, MapPin, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FieldPresenceIconsProps {
  lead: Lead
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FieldPresenceIcons({ lead, className }: FieldPresenceIconsProps) {
  const fields = [
    { icon: Mail, present: !!lead.email, label: 'Email' },
    { icon: Phone, present: !!lead.phone, label: 'Phone' },
    { icon: Globe, present: !!lead.website, label: 'Website' },
    { icon: MapPin, present: !!lead.address, label: 'Address' },
  ]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {fields.map((field) => {
        const Icon = field.icon
        const StatusIcon = field.present ? Check : X
        return (
          <div
            key={field.label}
            className={cn(
              'flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs',
              field.present
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-400'
            )}
            title={`${field.label}: ${field.present ? 'Present' : 'Missing'}`}
          >
            <Icon className="h-3 w-3" />
            <StatusIcon className="h-2.5 w-2.5" />
          </div>
        )
      })}
    </div>
  )
}
