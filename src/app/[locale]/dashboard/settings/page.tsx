'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { billingService } from '@/services/billing.service'
import { userService } from '@/services/user.service'
import analyticsService from '@/services/analytics.service'
import { useAuthStore } from '@/store/auth.store'
import type { PricingTier } from '@/types'
import dynamic from 'next/dynamic'
import { CreditCard, User, Check, Download, Shield, AlertTriangle, BarChart3, TrendingUp, Activity, RefreshCw } from 'lucide-react'
import type { UsageDataPoint } from '@/components/usage-chart'
import type { UsageBreakdown } from '@/components/usage-breakdown-chart'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'

const UsageChart = dynamic(() => import('@/components/usage-chart').then(m => ({ default: m.UsageChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-50 rounded-lg border border-gray-200 animate-pulse" />,
})
const UsageBreakdownChart = dynamic(() => import('@/components/usage-breakdown-chart').then(m => ({ default: m.UsageBreakdownChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-50 rounded-lg border border-gray-200 animate-pulse" />,
})

export default function SettingsPage() {
  const { toast } = useToast()
  const t = useTranslations('settings')
  const { user } = useAuthStore()
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(false)
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null)
  const [exportingData, setExportingData] = useState(false)
  const [restartingTutorial, setRestartingTutorial] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [usageData, setUsageData] = useState<UsageDataPoint[]>([])
  const [breakdownData, setBreakdownData] = useState<UsageBreakdown>({ searches: 0, exports: 0, apiCalls: 0 })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const router = useRouter()

  useEffect(() => {
    loadPricing()
    loadAnalytics()
  }, [])

  // Auto-refresh analytics every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadAnalytics()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const loadPricing = async () => {
    try {
      const response = await billingService.getPricing()
      setPricingTiers(response.tiers)
    } catch (error) {
      console.error('Failed to load pricing:', error)
    }
  }

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      // Fetch daily usage for chart (last 30 days)
      const dailyData = await analyticsService.getDailyUsage(30)

      // Transform daily usage data to match UsageChart interface
      const chartData: UsageDataPoint[] = dailyData.daily_usage.map(day => ({
        date: day.date,
        count: day.total
      }))
      setUsageData(chartData)

      // Fetch action breakdown for doughnut chart
      const breakdown = await analyticsService.getActionBreakdown(30)

      // Transform breakdown data to match UsageBreakdownChart interface
      const transformedBreakdown: UsageBreakdown = {
        searches: 0,
        exports: 0,
        apiCalls: 0
      }

      breakdown.breakdown.forEach(item => {
        if (item.action === 'search') {
          transformedBreakdown.searches = item.count
        } else if (item.action === 'export') {
          transformedBreakdown.exports = item.count
        } else if (item.action === 'api') {
          transformedBreakdown.apiCalls = item.count
        }
      })

      setBreakdownData(transformedBreakdown)
      setLastRefresh(new Date()) // Update last refresh timestamp
    } catch (error) {
      console.error('Failed to load analytics:', error)
      // Set empty data on error to show empty states
      setUsageData([])
      setBreakdownData({ searches: 0, exports: 0, apiCalls: 0 })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleUpgrade = async (tier: string) => {
    if (tier === 'free') return

    setUpgradingTo(tier)
    setLoading(true)

    try {
      const response = await billingService.createCheckout({
        tier: tier as 'starter' | 'pro' | 'business',
      })
      window.location.href = response.url
    } catch (error: any) {
      toast({
        title: t('toast.upgradeFailed'),
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      })
      setUpgradingTo(null)
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)
    try {
      const response = await billingService.createPortalSession(
        window.location.origin + '/dashboard/settings'
      )
      window.location.href = response.url
    } catch (error: any) {
      toast({
        title: t('toast.billingError'),
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setExportingData(true)
    try {
      await userService.exportPersonalData()
      toast({
        title: t('toast.exportSuccess'),
        description: t('toast.exportSuccessDesc'),
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: t('toast.exportFailed'),
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      })
    } finally {
      setExportingData(false)
    }
  }

  const handleRestartTutorial = async () => {
    setRestartingTutorial(true)
    try {
      await userService.resetOnboarding()
      toast({
        title: 'Tutorial Reset',
        description: 'Redirecting to onboarding wizard...',
        variant: 'default',
      })
      // Redirect to onboarding after short delay
      setTimeout(() => {
        router.push('/dashboard/onboarding')
      }, 1500)
    } catch (error: any) {
      toast({
        title: 'Failed to restart tutorial',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      })
      setRestartingTutorial(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: t('toast.passwordRequired'),
        description: t('toast.passwordRequiredDesc'),
        variant: 'destructive',
      })
      return
    }

    setDeletingAccount(true)
    try {
      await userService.deleteAccount(deletePassword)
      toast({
        title: t('toast.deletionSuccess'),
        description: t('toast.deletionSuccessDesc'),
        variant: 'default',
      })
      // Clear auth and redirect to home
      localStorage.removeItem('token')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error: any) {
      toast({
        title: t('toast.deletionFailed'),
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      })
      setDeletingAccount(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-4 sm:pt-6 lg:pt-8" role="main">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" aria-hidden="true" />
              {t('profile.title')}
            </CardTitle>
            <CardDescription>{t('profile.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profile-name">{t('profile.name')}</Label>
                <Input id="profile-name" value={user?.name || ''} disabled aria-readonly="true" />
              </div>
              <div>
                <Label htmlFor="profile-email">{t('profile.email')}</Label>
                <Input id="profile-email" type="email" value={user?.email || ''} disabled aria-readonly="true" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label>{t('profile.currentPlan')}</Label>
              <Badge variant="default" className="capitalize">
                {user?.subscription_tier}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('profile.usageThisMonth')}</p>
                <p className="text-lg font-bold">
                  {user?.usage_count} / {user?.usage_limit}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('profile.remainingLeads')}</p>
                <p className="text-lg font-bold">
                  {(user?.usage_limit || 0) - (user?.usage_count || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
              Usage & Analytics
            </CardTitle>
            <CardDescription>View your usage patterns and activity over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto-refresh controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Last updated:</span>
                  <span className="font-medium text-foreground">
                    {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAnalytics}
                  disabled={analyticsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
                  {analyticsLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-refresh" className="text-sm font-medium">
                  Auto-refresh (30s)
                </Label>
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <p className="text-sm font-semibold text-blue-900">Current Usage</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">{user?.usage_count || 0}</p>
                <p className="text-xs text-blue-700 mt-1">leads this month</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" aria-hidden="true" />
                  <p className="text-sm font-semibold text-purple-900">Usage Limit</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">{user?.usage_limit || 0}</p>
                <p className="text-xs text-purple-700 mt-1">leads per month</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                  <p className="text-sm font-semibold text-green-900">Remaining</p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {(user?.usage_limit || 0) - (user?.usage_count || 0)}
                </p>
                <p className="text-xs text-green-700 mt-1">leads available</p>
              </div>
            </div>

            {/* Upgrade Notice if near limit */}
            {user && user.usage_count >= user.usage_limit * 0.8 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Approaching Usage Limit
                    </h4>
                    <p className="text-sm text-amber-800 mb-3">
                      You've used {Math.round((user.usage_count / user.usage_limit) * 100)}% of your monthly limit.
                      Consider upgrading to continue accessing more leads.
                    </p>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        // Scroll to plans section
                        const plansSection = document.getElementById('plans-section')
                        plansSection?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      View Plans
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analyticsLoading ? (
                <>
                  <div className="h-[300px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Loading usage data...</p>
                  </div>
                  <div className="h-[300px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Loading breakdown...</p>
                  </div>
                </>
              ) : (
                <>
                  <UsageChart
                    data={usageData}
                    title="Daily Usage Trend"
                    height={300}
                  />
                  <UsageBreakdownChart
                    data={breakdownData}
                    title="Usage by Action Type"
                    height={300}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
              {t('billing.title')}
            </CardTitle>
            <CardDescription>{t('billing.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.subscription_tier !== 'free' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('billing.currentPlan', { tier: user?.subscription_tier })}
                </p>
                <Button onClick={handleManageBilling} disabled={loading} aria-label={loading ? t('billing.loading') : t('billing.manageBilling')}>
                  <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
                  {loading ? t('billing.loading') : t('billing.manageBilling')}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t('billing.manageBillingDesc')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                {t('billing.freePlanMsg')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" aria-hidden="true" />
              {t('privacy.title')}
            </CardTitle>
            <CardDescription>{t('privacy.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t('privacy.export.title')}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t('privacy.export.description')}
              </p>
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={exportingData}
                aria-label={exportingData ? t('privacy.export.downloading') : t('privacy.export.button')}
              >
                <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                {exportingData ? t('privacy.export.downloading') : t('privacy.export.button')}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Restart Tutorial</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Go through the onboarding wizard again to learn about all features.
              </p>
              <Button
                variant="outline"
                onClick={handleRestartTutorial}
                disabled={restartingTutorial}
                aria-label={restartingTutorial ? 'Restarting tutorial...' : 'Restart Tutorial'}
              >
                <User className="h-4 w-4 mr-2" aria-hidden="true" />
                {restartingTutorial ? 'Restarting...' : 'Restart Tutorial'}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {t('privacy.delete.title')}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t('privacy.delete.description')}
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                aria-label={t('privacy.delete.button')}
              >
                {t('privacy.delete.button')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div id="plans-section">
          <h2 className="text-2xl font-bold mb-4">{t('plans.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {pricingTiers.map((tier) => {
              const isCurrent = tier.name === user?.subscription_tier
              const isUpgrade = tier.name !== 'free' && !isCurrent

              return (
                <Card key={tier.name} className={isCurrent ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="capitalize">{tier.name}</CardTitle>
                      {isCurrent && <Badge>{t('plans.current')}</Badge>}
                    </div>
                    <div className="mb-2">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">{t('plans.perMonth')}</span>
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {isUpgrade && (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(tier.name)}
                        disabled={loading || upgradingTo !== null}
                      >
                        {upgradingTo === tier.name ? t('plans.redirecting') : t('plans.upgrade')}
                      </Button>
                    )}

                    {isCurrent && tier.name !== 'free' && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleManageBilling}
                        disabled={loading}
                      >
                        {t('plans.managePlan')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent role="alertdialog" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
          <DialogHeader>
            <DialogTitle id="delete-dialog-title" className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              {t('deleteDialog.title')}
            </DialogTitle>
            <DialogDescription id="delete-dialog-description">
              {t('deleteDialog.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">
                {t('deleteDialog.passwordLabel')}
              </Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t('deleteDialog.passwordPlaceholder')}
                disabled={deletingAccount}
                aria-required="true"
                aria-invalid={!deletePassword && deletingAccount}
              />
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <h4 className="font-semibold text-sm mb-2">{t('deleteDialog.whatDeleted')}</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• {t('deleteDialog.items.profile')}</li>
                <li>• {t('deleteDialog.items.usage')}</li>
                <li>• {t('deleteDialog.items.subscription')}</li>
                <li>• {t('deleteDialog.items.exports')}</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletePassword('')
              }}
              disabled={deletingAccount}
            >
              {t('deleteDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deletingAccount || !deletePassword}
            >
              {deletingAccount ? t('deleteDialog.deleting') : t('deleteDialog.deleteButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
