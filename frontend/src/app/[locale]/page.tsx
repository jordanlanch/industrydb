'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Zap, Shield, DollarSign, Globe, Building2, Users, Check, ArrowRight } from 'lucide-react'
import { CookieConsentBanner } from '@/components/cookie-consent-i18n'

// Stats data
const stats = [
  { id: 'leads', value: '82,740+', icon: Database },
  { id: 'countries', value: '184', icon: Globe },
  { id: 'industries', value: '20+', icon: Building2 },
  { id: 'users', value: '1,000+', icon: Users },
];

// Pricing tiers
const pricingTiers = [
  { id: 'free', price: '$0', leads: '50', popular: false },
  { id: 'starter', price: '$49', leads: '500', popular: true },
  { id: 'pro', price: '$149', leads: '2,000', popular: false },
  { id: 'business', price: '$349', leads: '10,000', popular: false },
];

export default function HomePage() {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const tFooter = useTranslations('footer');
  const tStats = useTranslations('landing.stats');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "IndustryDB",
    "description": "Industry-specific business data platform providing verified local business leads",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0",
      "highPrice": "349",
      "priceCurrency": "USD",
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">IndustryDB</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {tNav('pricing')}
              </Link>
              <Link href="/login">
                <Button variant="ghost">{tNav('login')}</Button>
              </Link>
              <Link href="/register">
                <Button>{tCommon('getStarted')}</Button>
              </Link>
            </div>
            <div className="md:hidden flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">{tNav('login')}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{tCommon('getStarted')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {t('hero.secondary')}
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              50 free leads per month. No credit card required.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.id} className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tStats(stat.id)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              {t('features.title')}
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <Database className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{t('features.verified.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('features.verified.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Instant Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Search and export data instantly. No waiting, no delays
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <DollarSign className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{t('features.affordable.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('features.affordable.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Industry Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Specialized data for tattoo, beauty, fitness, and hospitality industries
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              {t('pricing.subtitle')}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => (
                <Card 
                  key={tier.id} 
                  className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">{t(`pricing.${tier.id}.name`)}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.price !== '$0' && <span className="text-muted-foreground">/mo</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {tier.leads} leads/month
                    </p>
                    <Link href="/register">
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
            <div className="text-center mt-8">
              <Link href="/pricing" className="text-primary hover:underline font-medium">
                View full pricing details →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {t('cta.subtitle')}
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                {t('cta.button')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-4">
                <Database className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-white">IndustryDB</span>
              </div>
              <p className="text-sm text-gray-400">
                {tFooter('description')}
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {tFooter('product')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/pricing" className="text-sm hover:text-white transition-colors">
                    {tNav('pricing')}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-sm hover:text-white transition-colors">
                    {tNav('register')}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm hover:text-white transition-colors">
                    {tNav('login')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {tFooter('company')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm hover:text-white transition-colors">
                    {tFooter('aboutUs')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm hover:text-white transition-colors">
                    {tFooter('contact')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {tFooter('legal')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-400 text-center">
              © {currentYear} IndustryDB. {tFooter('allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>

      {/* Cookie Consent */}
      <CookieConsentBanner />
    </div>
  )
}
