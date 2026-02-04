/**
 * Main Dashboard Page
 * Overview with widgets, stats, and quick actions
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore } from '@/store/auth.store'
import { leadsService } from '@/services/leads.service'
import { useOrganization } from '@/contexts/organization.context'
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
  const t = useTranslations('dashboard')
  const { user } = useAuthStore()
  const { currentOrganization, currentUsage, usageLimit, remainingLeads } = useOrganization()
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [stats, setStats] = useState({
    totalLeads: 100000,
    newThisWeek: 2341,
    countries: 7,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsage()
  }, [currentOrganization]) // Reload when organization changes

  const loadUsage = async () => {
    try {
      // If using an organization, use organization usage data from context
      if (currentOrganization) {
        setUsage({
          usage_count: currentUsage,
          usage_limit: usageLimit,
          remaining: remainingLeads,
          tier: currentOrganization.subscription_tier,
          reset_at: '', // Organization doesn't expose reset_at yet
        })
      } else {
        // Personal account - fetch from API
        const data = await leadsService.getUsage()
        setUsage(data)
      }
    } catch (error) {
      console.error('Failed to load usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('greeting.morning')
    if (hour < 18) return t('greeting.afternoon')
    return t('greeting.evening')
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
    <TooltipProvider>
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name || 'there'}!
            </h1>
            <p className="text-muted-foreground">
              {t('welcome')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getTierBadgeVariant(currentOrganization?.subscription_tier || user?.subscription_tier || 'free')} className="text-sm">
              {t('planBadge', { tier: (currentOrganization?.subscription_tier || user?.subscription_tier || 'FREE').toUpperCase() })}
            </Badge>
            {user?.subscription_tier === 'free' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard/settings/billing">
                    <Button size="sm">
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t('upgrade')}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get more leads and unlock advanced features</p>
                </TooltipContent>
              </Tooltip>
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
                  <h3 className="text-lg font-semibold">
                    {currentOrganization
                      ? `${currentOrganization.name} - ${t('monthlyUsage')}`
                      : t('monthlyUsage')}
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant={usage.remaining > 10 ? 'default' : 'destructive'}>
                        {usage.remaining} {t('remaining')}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of leads you can still access this month</p>
                      <p className="text-xs mt-1">Resets on {new Date(usage.reset_at || Date.now()).toLocaleDateString()}</p>
                    </TooltipContent>
                  </Tooltip>
                  {currentOrganization && (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Organization
                    </Badge>
                  )}
                </div>
                <p className="text-3xl font-bold text-primary">
                  {usage.usage_count} / {usage.usage_limit}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('leadsAccessed')}
                </p>
              </div>

              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/dashboard/leads">
                      <Button>
                        <Search className="mr-2 h-4 w-4" />
                        {t('searchLeads')}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Find business leads by industry, location, and more</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/dashboard/exports">
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        {t('exports')}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download your search results as CSV or Excel files</p>
                  </TooltipContent>
                </Tooltip>
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
            <CardTitle className="text-sm font-medium">{t('stats.totalLeads')}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLeads.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.acrossIndustries')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.newThisWeek')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{stats.newThisWeek.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.freshData')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.countries')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.countries}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.countriesList')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('quickActions.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard/leads">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <Search className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-1">{t('quickActions.searchLeads')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('quickActions.searchLeadsDesc')}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Filter by industry, country, city, and contact info</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard/saved-searches">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <Database className="h-8 w-8 text-blue-500 mb-3" />
                    <h3 className="font-semibold mb-1">{t('quickActions.savedSearches')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('quickActions.savedSearchesDesc')}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Reuse your favorite search filters without re-entering them</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard/exports">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <Download className="h-8 w-8 text-green-500 mb-3" />
                    <h3 className="font-semibold mb-1">{t('quickActions.viewExports')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('quickActions.viewExportsDesc')}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Download and manage all your exported files in one place</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard/settings/billing">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <TrendingUp className="h-8 w-8 text-purple-500 mb-3" />
                    <h3 className="font-semibold mb-1">{t('quickActions.upgradePlan')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('quickActions.upgradePlanDesc')}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Get more leads, email addresses, and API access with a paid plan</p>
            </TooltipContent>
          </Tooltip>
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
    </TooltipProvider>
  )
}
