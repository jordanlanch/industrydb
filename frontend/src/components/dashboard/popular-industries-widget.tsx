/**
 * Popular Industries Widget
 * Shows most searched industries with lead counts
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IndustryIcon } from '@/components/industry-icon'
import { TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface PopularIndustry {
  id: string
  name: string
  leadCount: number
  change: number // percentage change
  topSubNiches?: string[]
}

interface PopularIndustriesWidgetProps {
  industries?: PopularIndustry[]
  loading?: boolean
}

// Mock data for demonstration
const mockIndustries: PopularIndustry[] = [
  {
    id: 'restaurant',
    name: 'Restaurants',
    leadCount: 30000,
    change: 23,
    topSubNiches: ['Italian', 'Mexican', 'Japanese'],
  },
  {
    id: 'gym',
    name: 'Gyms & Fitness',
    leadCount: 12000,
    change: 15,
    topSubNiches: ['CrossFit', 'Yoga', 'Traditional'],
  },
  {
    id: 'tattoo',
    name: 'Tattoo Studios',
    leadCount: 8000,
    change: 8,
    topSubNiches: ['Japanese', 'Traditional', 'Watercolor'],
  },
  {
    id: 'beauty',
    name: 'Beauty Salons',
    leadCount: 10000,
    change: 12,
    topSubNiches: ['Hair', 'Nails', 'Spa'],
  },
  {
    id: 'cafe',
    name: 'Cafes & Coffee Shops',
    leadCount: 8000,
    change: 5,
    topSubNiches: ['Specialty Coffee', 'Cafe', 'Bakery'],
  },
]

export function PopularIndustriesWidget({
  industries = mockIndustries,
  loading = false,
}: PopularIndustriesWidgetProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Popular Industries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Popular Industries
            </CardTitle>
            <CardDescription>Most searched industries this week</CardDescription>
          </div>
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {industries.map((industry, index) => (
            <Link
              key={industry.id}
              href={`/dashboard/leads?industry=${industry.id}`}
              className="block"
            >
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                {/* Rank & Icon */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <IndustryIcon
                    industryId={industry.id}
                    size="lg"
                    showBackground
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {industry.name}
                    </h3>
                    {industry.change > 0 && (
                      <Badge variant="default" className="text-xs">
                        +{industry.change}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatNumber(industry.leadCount)} leads</span>
                    {industry.topSubNiches && industry.topSubNiches.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="truncate">
                          {industry.topSubNiches.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
