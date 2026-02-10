'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Check, ArrowLeft } from 'lucide-react'

const pricingTiers = [
  { id: 'free', price: '$0', leads: '50', popular: false },
  { id: 'starter', price: '$49', leads: '500', popular: false },
  { id: 'pro', price: '$149', leads: '2,000', popular: true },
  { id: 'business', price: '$349', leads: '10,000', popular: false },
];

export default function PricingPage() {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center">
              <Database className="h-8 w-8 text-primary" aria-hidden="true" />
              <span className="ml-2 text-xl font-bold">IndustryDB</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">{tNav('login')}</Button>
              </Link>
              <Link href="/register">
                <Button>{tCommon('getStarted')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {tCommon('back')}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('pricing.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('pricing.subtitle')}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {t('mostPopular')}
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{t(`pricing.${tier.id}.name`)}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== '$0' && <span className="text-muted-foreground">/mo</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t(`pricing.${tier.id}.description`)}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {(t.raw(`pricing.${tier.id}.features`) as string[]).map((feature: string, i: number) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    className="w-full"
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {tCommon('getStarted')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-12 bg-primary/5 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-muted-foreground mb-6">{t('cta.subtitle')}</p>
          <Link href="/register">
            <Button size="lg">
              {t('cta.button')}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
