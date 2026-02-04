import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomProgress } from '@/components/ui/custom-progress'
import type { LeadStatistics } from '@/types'
import { getProgressColor, formatNumber } from '@/lib/lead-stats'
import { Mail, Phone, Globe, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DataQualityCardProps {
  stats: LeadStatistics
}

export function DataQualityCard({ stats }: DataQualityCardProps) {
  const completenessFields = [
    {
      label: 'Email',
      icon: Mail,
      data: stats.completeness.email,
    },
    {
      label: 'Phone',
      icon: Phone,
      data: stats.completeness.phone,
    },
    {
      label: 'Website',
      icon: Globe,
      data: stats.completeness.website,
    },
    {
      label: 'Address',
      icon: MapPin,
      data: stats.completeness.address,
    },
  ]

  const qualityBuckets = [
    {
      label: 'High',
      sublabel: '70-100',
      count: stats.qualityDistribution.high,
      color: 'bg-green-500',
      icon: TrendingUp,
    },
    {
      label: 'Medium',
      sublabel: '40-69',
      count: stats.qualityDistribution.medium,
      color: 'bg-yellow-500',
      icon: Minus,
    },
    {
      label: 'Low',
      sublabel: '0-39',
      count: stats.qualityDistribution.low,
      color: 'bg-red-500',
      icon: TrendingDown,
    },
  ]

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Data Quality Insights</CardTitle>
        <CardDescription>Completeness metrics and quality distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Completeness Metrics */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Field Completeness</h3>
            <div className="space-y-3">
              {completenessFields.map((field) => {
                const Icon = field.icon
                return (
                  <div key={field.label} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{field.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(field.data.count)} ({field.data.percentage}%)
                        </span>
                      </div>
                      <CustomProgress
                        value={field.data.percentage}
                        indicatorClassName={getProgressColor(field.data.percentage)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quality Distribution */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Quality Score Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {qualityBuckets.map((bucket) => {
                const Icon = bucket.icon
                return (
                  <div
                    key={bucket.label}
                    className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Icon className={`h-5 w-5 mb-2 ${bucket.color.replace('bg-', 'text-')}`} />
                    <div className="text-2xl font-bold">{formatNumber(bucket.count)}</div>
                    <div className="text-sm font-medium">{bucket.label}</div>
                    <div className="text-xs text-muted-foreground">{bucket.sublabel}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
