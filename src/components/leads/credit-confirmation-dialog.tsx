'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { UsageInfo } from '@/types'

interface CreditConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  usage: UsageInfo | null
}

export function CreditConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  usage,
}: CreditConfirmationDialogProps) {
  const t = useTranslations('leads.creditDialog')
  const locale = useLocale()

  if (!usage) return null

  const remainingAfterSearch = usage.remaining - 1

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {/* Credit Usage Info */}
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-900 mb-2">
                {t('useOneCredit')}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-700">{t('creditsRemaining')}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">
                    {usage.remaining} → {remainingAfterSearch}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Warning Messages */}
            {remainingAfterSearch <= 5 && remainingAfterSearch > 0 && (
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-xs text-orange-900 font-medium mb-1">
                  {t('runningLow')}
                </p>
                <p className="text-xs text-orange-700">
                  {t('runningLowDesc', { count: remainingAfterSearch })}
                </p>
              </div>
            )}

            {remainingAfterSearch === 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-900 font-medium mb-1">
                  {t('lastSearch')}
                </p>
                <p className="text-xs text-red-700">
                  {t('lastSearchDesc', { date: usage.reset_at ? new Date(usage.reset_at).toLocaleDateString(locale) : '' })}
                </p>
              </div>
            )}

            {/* Upgrade Prompt for Low Credits */}
            {usage.remaining <= 10 && usage.tier === 'free' && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-primary mb-1">{t('needMore')}</p>
                    <p className="text-muted-foreground mb-2">
                      {t('upgradeDesc')}
                    </p>
                    <a
                      href="/dashboard/settings?tab=billing"
                      className="text-primary hover:underline font-medium"
                    >
                      {t('viewPlans')} →
                    </a>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {t('note')}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('searchAnyway')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
