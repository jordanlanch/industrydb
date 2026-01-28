'use client'

import { useState, useEffect } from 'react'
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
        title: 'Upgrade Failed',
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
        title: 'Billing Portal Error',
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
        title: 'Data Exported!',
        description: 'Your personal data has been downloaded successfully',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Export Failed',
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
        title: 'Password Required',
        description: 'Please enter your password to confirm account deletion',
        variant: 'destructive',
      })
      return
    }

    setDeletingAccount(true)
    try {
      await userService.deleteAccount(deletePassword)
      toast({
        title: 'Account Deleted',
        description: 'Your account has been deleted successfully',
        variant: 'default',
      })
      // Clear auth and redirect to home
      localStorage.removeItem('token')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      })
      setDeletingAccount(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={user?.name || ''} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label>Current Plan:</Label>
              <Badge variant="default" className="capitalize">
                {user?.subscription_tier}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Usage This Month</p>
                <p className="text-lg font-bold">
                  {user?.usage_count} / {user?.usage_limit}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining Leads</p>
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
              <CreditCard className="h-5 w-5" />
              Billing & Subscription
            </CardTitle>
            <CardDescription>Manage your subscription and payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.subscription_tier !== 'free' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You are currently on the <strong className="capitalize">{user?.subscription_tier}</strong> plan.
                </p>
                <Button onClick={handleManageBilling} disabled={loading}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loading ? 'Loading...' : 'Manage Billing'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Update payment method, view invoices, or cancel subscription
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                You are on the Free plan. Upgrade below to access more features.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>Manage your personal data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">GDPR Data Export</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your personal data in JSON format. This includes your profile, usage history,
                subscription details, and export history.
              </p>
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={exportingData}
              >
                <Download className="h-4 w-4 mr-2" />
                {exportingData ? 'Downloading...' : 'Download My Data (GDPR)'}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Delete Account
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => {
              const isCurrent = tier.name === user?.subscription_tier
              const isUpgrade = tier.name !== 'free' && !isCurrent

              return (
                <Card key={tier.name} className={isCurrent ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="capitalize">{tier.name}</CardTitle>
                      {isCurrent && <Badge>Current</Badge>}
                    </div>
                    <div className="mb-2">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">/month</span>
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
                        {upgradingTo === tier.name ? 'Redirecting...' : 'Upgrade'}
                      </Button>
                    )}

                    {isCurrent && tier.name !== 'free' && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleManageBilling}
                        disabled={loading}
                      >
                        Manage Plan
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account,
              cancel your subscription, and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">
                Enter your password to confirm
              </Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                disabled={deletingAccount}
              />
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <h4 className="font-semibold text-sm mb-2">What will be deleted:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Your profile and account information</li>
                <li>• All usage history and statistics</li>
                <li>• Subscription and billing records</li>
                <li>• All data exports</li>
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
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deletingAccount || !deletePassword}
            >
              {deletingAccount ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
