'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { billingService } from '@/services/billing.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import type { PricingTier } from '@/types'
import { CreditCard, User, Check, Download, Shield, AlertTriangle } from 'lucide-react'
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

export default function SettingsPage() {
  const { toast } = useToast()
  const t = useTranslations('settings')
  const { user } = useAuthStore()
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(false)
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null)
  const [exportingData, setExportingData] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    try {
      const response = await billingService.getPricing()
      setPricingTiers(response.tiers)
    } catch (error) {
      console.error('Failed to load pricing:', error)
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
    <div className="p-8" role="main">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4 text-sm">
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

        <div>
          <h2 className="text-2xl font-bold mb-4">{t('plans.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
