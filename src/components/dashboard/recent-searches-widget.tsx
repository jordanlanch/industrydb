/**
 * Recent Searches Widget
 * Shows user's recent search history with quick re-run
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Search, ArrowRight, Bookmark } from 'lucide-react'

interface RecentSearch {
  id: string
  query: string
  industry?: string
  subNiche?: string
  location?: string
  timestamp: string
  resultCount?: number
}

interface RecentSearchesWidgetProps {
  maxItems?: number
}

export function RecentSearchesWidget({ maxItems = 5 }: RecentSearchesWidgetProps) {
  const router = useRouter()
  const [searches, setSearches] = useState<RecentSearch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentSearches()
  }, [])

  const loadRecentSearches = () => {
    // Load from localStorage
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSearches(parsed.slice(0, maxItems))
      } catch (error) {
        console.error('Failed to parse recent searches:', error)
      }
    } else {
      // Mock data for demonstration
      setSearches([
        {
          id: '1',
          query: 'Italian Restaurants',
          industry: 'Restaurant',
          subNiche: 'Italian',
          location: 'New York, US',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          resultCount: 234,
        },
        {
          id: '2',
          query: 'CrossFit Gyms',
          industry: 'Gym',
          subNiche: 'CrossFit',
          location: 'Los Angeles, US',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          resultCount: 156,
        },
        {
          id: '3',
          query: 'Beauty Salons with Email',
          industry: 'Beauty',
          location: 'Chicago, US',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          resultCount: 89,
        },
      ])
    }
    setLoading(false)
  }

  const handleRerun = (search: RecentSearch) => {
    // Store filters in session storage
    const filters: any = {}
    if (search.industry) filters.industry = search.industry
    if (search.subNiche) filters.sub_niche = search.subNiche
    if (search.location) {
      const parts = search.location.split(', ')
      if (parts.length >= 2) {
        filters.city = parts[0]
        filters.country = parts[1]
      }
    }

    sessionStorage.setItem('leadFilters', JSON.stringify(filters))
    router.push('/dashboard/leads')
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (searches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Searches
          </CardTitle>
          <CardDescription>Your recent search history</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">No recent searches</p>
            <Link href="/dashboard/leads">
              <Button size="sm">Start Searching</Button>
            </Link>
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
              <Clock className="h-5 w-5 text-blue-500" />
              Recent Searches
            </CardTitle>
            <CardDescription>Your recent search history</CardDescription>
          </div>
          <Link href="/dashboard/saved-searches">
            <Button variant="ghost" size="sm">
              <Bookmark className="mr-2 h-4 w-4" />
              Saved
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                <Search className="h-4 w-4 text-blue-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate mb-1">
                  {search.query}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {search.industry && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {search.industry}
                    </Badge>
                  )}
                  {search.location && (
                    <span className="truncate">{search.location}</span>
                  )}
                  <span>•</span>
                  <span>{formatTimestamp(search.timestamp)}</span>
                </div>
              </div>

              {/* Result Count & Action */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {search.resultCount !== undefined && (
                  <div className="text-right">
                    <div className="text-xs font-semibold text-primary">
                      {search.resultCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground">results</div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRerun(search)}
                  className="h-8 w-8 p-0"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Link href="/dashboard/leads">
            <Button variant="outline" size="sm" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              New Search
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
