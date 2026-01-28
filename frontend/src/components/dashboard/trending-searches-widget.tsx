/**
 * Trending Searches Widget
 * Shows popular search combinations and filters
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'

interface TrendingSearch {
  id: string
  query: string
  industry: string
  location?: string
  count: number
  change: number // percentage change
  tags?: string[]
}

interface TrendingSearchesWidgetProps {
  searches?: TrendingSearch[]
  loading?: boolean
}

// Mock data for demonstration
const mockSearches: TrendingSearch[] = [
  {
    id: '1',
    query: 'Italian Restaurants in NYC',
    industry: 'Restaurant',
    location: 'New York, US',
    count: 342,
    change: 45,
    tags: ['Italian', 'NYC', 'Fine Dining'],
  },
  {
    id: '2',
    query: 'CrossFit Gyms with Email',
    industry: 'Gym',
    location: 'Los Angeles, US',
    count: 198,
    change: 32,
    tags: ['CrossFit', 'Email', 'LA'],
  },
  {
    id: '3',
    query: 'Japanese Tattoo Studios',
    industry: 'Tattoo',
    location: 'San Francisco, US',
    count: 156,
    change: 28,
    tags: ['Japanese', 'Irezumi', 'SF'],
  },
  {
    id: '4',
    query: 'Verified Beauty Salons',
    industry: 'Beauty',
    location: 'Chicago, US',
    count: 134,
    change: 21,
    tags: ['Verified', 'Beauty', 'Chicago'],
  },
  {
    id: '5',
    query: 'Mexican Restaurants with Delivery',
    industry: 'Restaurant',
    location: 'Austin, US',
    count: 112,
    change: 18,
    tags: ['Mexican', 'Delivery', 'Austin'],
  },
]

export function TrendingSearchesWidget({
  searches = mockSearches,
  loading = false,
}: TrendingSearchesWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Trending Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg" />
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
              <Flame className="h-5 w-5 text-orange-500" />
              Trending Searches
            </CardTitle>
            <CardDescription>Popular searches this week</CardDescription>
          </div>
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="sm">
              Explore
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {searches.map((search, index) => (
            <div
              key={search.id}
              className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            >
              <div className="flex items-start gap-3">
                {/* Trend Indicator */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      index === 0
                        ? 'bg-orange-100 text-orange-600'
                        : index === 1
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {search.change > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 h-4 border-green-300 text-green-700"
                    >
                      +{search.change}%
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1.5 line-clamp-1">
                    {search.query}
                  </h3>

                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {search.industry}
                    </Badge>
                    {search.location && (
                      <>
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{search.location}</span>
                      </>
                    )}
                  </div>

                  {search.tags && search.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {search.tags.slice(0, 3).map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Count */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-primary">
                    {search.count}
                  </div>
                  <div className="text-[10px] text-muted-foreground">searches</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <Link href="/dashboard/leads">
            <Button variant="outline" size="sm" className="w-full">
              Search for Leads
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
