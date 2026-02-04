import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LeadSearchRequest } from '@/types'
import { X } from 'lucide-react'

interface ActiveFiltersCardProps {
  filters: LeadSearchRequest
  onRemoveFilter: (key: keyof LeadSearchRequest) => void
  onClearAll: () => void
}

export function ActiveFiltersCard({ filters, onRemoveFilter, onClearAll }: ActiveFiltersCardProps) {
  const activeFilters: { key: keyof LeadSearchRequest; label: string; value: string }[] = []

  if (filters.industry) {
    activeFilters.push({
      key: 'industry',
      label: 'Industry',
      value: filters.industry,
    })
  }

  if (filters.country) {
    activeFilters.push({
      key: 'country',
      label: 'Country',
      value: filters.country,
    })
  }

  if (filters.city) {
    activeFilters.push({
      key: 'city',
      label: 'City',
      value: filters.city,
    })
  }

  if (filters.has_email) {
    activeFilters.push({
      key: 'has_email',
      label: 'Has Email',
      value: 'Yes',
    })
  }

  if (filters.has_phone) {
    activeFilters.push({
      key: 'has_phone',
      label: 'Has Phone',
      value: 'Yes',
    })
  }

  if (filters.verified) {
    activeFilters.push({
      key: 'verified',
      label: 'Verified',
      value: 'Yes',
    })
  }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-auto py-1 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs">
                {filter.label}: {filter.value}
              </span>
              <button
                onClick={() => onRemoveFilter(filter.key)}
                className="ml-1 rounded-full hover:bg-gray-300 p-0.5 transition-colors"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
