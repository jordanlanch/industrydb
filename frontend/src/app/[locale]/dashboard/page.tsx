/**
 * Main Dashboard Page
 * Overview with widgets, stats, and quick actions
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth.store'
import { leadsService } from '@/services/leads.service'
import { PopularIndustriesWidget } from '@/components/dashboard/popular-industries-widget'
import { TrendingSearchesWidget } from '@/components/dashboard/trending-searches-widget'
import { RecentSearchesWidget } from '@/components/dashboard/recent-searches-widget'
import {
  Search,
  Download,
  TrendingUp,
  Users,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import type { UsageInfo } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [stats, setStats] = useState({
    totalLeads: 100000,
    newThisWeek: 2341,
    countries: 7,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsage()
  }, [])

  const loadUsage = async () => {
    try {
      const data = await leadsService.getUsage()
      setUsage(data)
    } catch (error) {
      console.error('Failed to load usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'business':
        return 'default'
      case 'pro':
        return 'default'
      case 'starter':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name || 'there'}!
            </h1>
            <p className="text-muted-foreground">
              Welcome to your IndustryDB dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getTierBadgeVariant(user?.subscription_tier || 'free')} className="text-sm">
              {user?.subscription_tier?.toUpperCase() || 'FREE'} PLAN
            </Badge>
            {user?.subscription_tier === 'free' && (
              <Link href="/dashboard/settings/billing">
                <Button size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Usage Card */}
      {usage && (
        <Card className="mb-6 border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">Monthly Usage</h3>
                  <Badge variant={usage.remaining > 10 ? 'default' : 'destructive'}>
                    {usage.remaining} remaining
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {usage.usage_count} / {usage.usage_limit}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Leads accessed this month
                </p>
              </div>

              <div className="flex gap-2">
                <Link href="/dashboard/leads">
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Search Leads
                  </Button>
                </Link>
                <Link href="/dashboard/exports">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exports
                  </Button>
                </Link>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usage.remaining > 10 ? 'bg-primary' : 'bg-destructive'
                  }`}
                  style={{
                    width: `${(usage.usage_count / usage.usage_limit) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLeads.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all industries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{stats.newThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Fresh verified data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.countries}</div>
            <p className="text-xs text-muted-foreground">
              US, GB, DE, ES, FR, CA, AU
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/leads">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <Search className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Search Leads</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Find verified business data
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/saved-searches">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <Database className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-1">Saved Searches</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Access your saved filters
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/exports">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <Download className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold mb-1">View Exports</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Download your data exports
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/settings/billing">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-1">Upgrade Plan</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get more leads and features
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PopularIndustriesWidget loading={loading} />
          <RecentSearchesWidget maxItems={5} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TrendingSearchesWidget loading={loading} />
        </div>
      </div>
    </div>
  )
}
