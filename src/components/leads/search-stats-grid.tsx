import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LeadStatistics } from '@/types'
import { Database, TrendingUp, CheckCircle, Award } from 'lucide-react'
import { formatNumber } from '@/lib/lead-stats'

interface SearchStatsGridProps {
  stats: LeadStatistics
}

export function SearchStatsGrid({ stats }: SearchStatsGridProps) {
  const statCards = [
    {
      title: 'Total Results',
      value: formatNumber(stats.totalResults),
      icon: Database,
      description: 'Matching leads found',
    },
    {
      title: 'Avg Quality',
      value: stats.avgQualityScore.toFixed(1),
      icon: TrendingUp,
      description: 'Average quality score',
    },
    {
      title: 'Verified',
      value: `${stats.verifiedPercentage}%`,
      icon: CheckCircle,
      description: `${formatNumber(stats.verifiedCount)} verified leads`,
    },
    {
      title: 'Complete',
      value: formatNumber(stats.completeProfiles),
      icon: Award,
      description: 'Profiles with all fields',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
