'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Building2, Shield, TrendingUp, Sparkles } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import type { UsageInfo } from '@/types'

interface EmptySearchStateProps {
  usage: UsageInfo | null
  onQuickSearch?: (industry: string, country: string) => void
}

export function EmptySearchState({ usage, onQuickSearch }: EmptySearchStateProps) {
  const t = useTranslations('leads.searchState')
  const locale = useLocale()

  const quickSearchExamples = [
    { industry: 'tattoo', country: 'US', label: `🎨 ${t('tattooUSA')}` },
    { industry: 'beauty', country: 'GB', label: `💅 ${t('beautyUK')}` },
    { industry: 'gym', country: 'ES', label: `💪 ${t('gymsSpain')}` },
    { industry: 'restaurant', country: 'DE', label: `🍽️ ${t('restaurantsGermany')}` },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 max-w-3xl mx-auto">
      {/* Hero Icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
        <Search className="h-10 w-10 text-primary" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        {t('subtitle')}
      </p>

      {/* How It Works */}
      <Card className="w-full mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('howItWorks')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">{t('step1Title')}</p>
                <p className="text-xs text-muted-foreground">{t('step1Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">{t('step2Title')}</p>
                <p className="text-xs text-muted-foreground">{t('step2Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">{t('step3Title')}</p>
                <p className="text-xs text-muted-foreground">{t('step3Desc')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium mb-1">{t('oneCredit')}</p>
            <p className="text-xs text-muted-foreground">{t('oneCreditDesc')}</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium mb-1">{t('paginationFree')}</p>
            <p className="text-xs text-muted-foreground">{t('paginationFreeDesc')}</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium mb-1">{t('verifiedData')}</p>
            <p className="text-xs text-muted-foreground">{t('verifiedDataDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Info */}
      {usage && (
        <div className="w-full p-4 rounded-lg bg-gray-50 border mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t('searchesRemaining')}</span>
            <Badge variant={usage.remaining <= 10 ? 'destructive' : usage.remaining <= 20 ? 'default' : 'secondary'}>
              {t('remainingOf', { remaining: usage.remaining, limit: usage.usage_limit })}
            </Badge>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usage.remaining === 0
                  ? 'bg-red-500'
                  : usage.remaining <= 10
                  ? 'bg-orange-500'
                  : usage.remaining <= 20
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${(usage.remaining / usage.usage_limit) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {usage.remaining === 0 ? (
                t('noSearchesLeft')
              ) : usage.remaining <= 10 ? (
                t('runningLow', { remaining: usage.remaining })
              ) : (
                t('searchesAvailable', { remaining: usage.remaining })
              )}
            </p>
            {usage.reset_at && (
              <p className="text-xs text-muted-foreground">
                {t('resetsOn', { date: new Date(usage.reset_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' }) })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick Search Examples */}
      {onQuickSearch && (
        <div className="w-full">
          <p className="text-sm font-medium mb-3 text-center">{t('quickStart')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickSearchExamples.map((example) => (
              <Button
                key={`${example.industry}-${example.country}`}
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => onQuickSearch(example.industry, example.country)}
              >
                {example.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
