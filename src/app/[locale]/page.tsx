'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Database, Zap, Shield, Globe, Building2, Users, Check, ArrowRight, X, Target, Download, Mail, Phone, MapPin, Star } from 'lucide-react'
import { CookieConsentBanner } from '@/components/cookie-consent-i18n'
import { LanguageSwitcher } from '@/components/language-switcher'

const pricingTiers = [
  { id: 'free', price: '$0', leads: '50', popular: false, costPerLead: '$0' },
  { id: 'starter', price: '$49', leads: '500', popular: true, costPerLead: '$0.098' },
  { id: 'pro', price: '$149', leads: '2,000', popular: false, costPerLead: '$0.075' },
  { id: 'business', price: '$349', leads: '10,000', popular: false, costPerLead: '$0.035' },
];

const industries = [
  'tattoo', 'beauty', 'barber', 'spa', 'gym', 'dentist',
  'restaurant', 'cafe', 'bar', 'bakery', 'car_repair', 'car_wash',
  'pharmacy', 'massage', 'clothing', 'convenience', 'lawyer', 'accountant',
  'nail_salon', 'car_dealer',
];

export default function HomePage() {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const tFooter = useTranslations('footer');

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
    <div className="min-h-screen bg-gray-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Navigation - Dark, minimal */}
      <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-40" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-yellow-400" aria-hidden="true" />
              <span className="ml-2 text-xl font-bold text-white">IndustryDB</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <LanguageSwitcher variant="dark" />
              <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                {tNav('pricing')}
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">{tNav('login')}</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-yellow-400 text-gray-950 hover:bg-yellow-300 font-bold">{t('hero.cta')}</Button>
              </Link>
            </div>
            <div className="md:hidden flex items-center gap-1 sm:gap-2">
              <LanguageSwitcher variant="dark" compact />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-300 px-2 sm:px-3">{tNav('login')}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-yellow-400 text-gray-950 hover:bg-yellow-300 font-bold px-2 sm:px-3 text-xs sm:text-sm">{t('hero.cta')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main role="main">

        {/* HERO - Problem + Big Promise */}
        <section className="pt-16 pb-20 px-4 relative overflow-hidden" aria-labelledby="hero-title">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none" aria-hidden="true" />
          <div className="max-w-5xl mx-auto text-center relative">
            <p className="text-yellow-400 font-semibold text-sm uppercase tracking-widest mb-6">
              {t('hero.badge')}
            </p>
            <h1 id="hero-title" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              {t('hero.title')}
              <span className="block text-yellow-400">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-4 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <p className="text-base md:text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              {t('hero.subtext')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-yellow-400 text-gray-950 hover:bg-yellow-300 font-bold text-lg px-10 py-6 h-auto">
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              {t('freeLeadsNote')}
            </p>
          </div>
        </section>

        {/* SOCIAL PROOF BAR - Big numbers */}
        <section className="py-12 bg-gray-900 border-y border-gray-800" aria-label="Platform statistics">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-400 mb-1">82,740+</div>
                <div className="text-sm text-gray-400">{t('stats.leads')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-1">184</div>
                <div className="text-sm text-gray-400">{t('stats.countries')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-1">20+</div>
                <div className="text-sm text-gray-400">{t('stats.industries')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-1">$0.035</div>
                <div className="text-sm text-gray-400">{t('stats.costPerLead')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM AGITATION - Why current methods suck */}
        <section className="py-20 px-4" aria-labelledby="problem-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="problem-title" className="text-3xl md:text-4xl font-extrabold text-center mb-4">
              {t('problem.title')}
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              {t('problem.subtitle')}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-red-900/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center">
                    <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{t('problem.manual.title')}</h3>
                    <p className="text-gray-400 text-sm">{t('problem.manual.desc')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 border border-red-900/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center">
                    <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{t('problem.expensive.title')}</h3>
                    <p className="text-gray-400 text-sm">{t('problem.expensive.desc')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 border border-red-900/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center">
                    <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{t('problem.outdated.title')}</h3>
                    <p className="text-gray-400 text-sm">{t('problem.outdated.desc')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 border border-red-900/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center">
                    <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{t('problem.generic.title')}</h3>
                    <p className="text-gray-400 text-sm">{t('problem.generic.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTION - What you get */}
        <section className="py-20 px-4 bg-gray-900" aria-labelledby="solution-title">
          <div className="max-w-5xl mx-auto">
            <p className="text-yellow-400 font-semibold text-sm uppercase tracking-widest text-center mb-4">
              {t('solution.badge')}
            </p>
            <h2 id="solution-title" className="text-3xl md:text-4xl font-extrabold text-center mb-4">
              {t('solution.title')}
            </h2>
            <p className="text-center text-gray-400 mb-14 max-w-2xl mx-auto">
              {t('solution.subtitle')}
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-7 w-7 text-yellow-400" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('solution.targeted.title')}</h3>
                <p className="text-gray-400 text-sm">{t('solution.targeted.desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-7 w-7 text-yellow-400" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('solution.verified.title')}</h3>
                <p className="text-gray-400 text-sm">{t('solution.verified.desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-7 w-7 text-yellow-400" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{t('solution.instant.title')}</h3>
                <p className="text-gray-400 text-sm">{t('solution.instant.desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE STACK - Everything included */}
        <section className="py-20 px-4" aria-labelledby="value-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="value-title" className="text-3xl md:text-4xl font-extrabold text-center mb-4">
              {t('value.title')}
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              {t('value.subtitle')}
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-10">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Database, key: 'data' },
                  { icon: Phone, key: 'phone' },
                  { icon: Mail, key: 'email' },
                  { icon: Globe, key: 'website' },
                  { icon: MapPin, key: 'address' },
                  { icon: Star, key: 'quality' },
                  { icon: Download, key: 'export' },
                  { icon: Building2, key: 'industries' },
                ].map(({ icon: Icon, key }) => (
                  <div key={key} className="flex items-center gap-3 py-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="font-semibold text-white">{t(`value.items.${key}.title`)}</span>
                      <span className="text-gray-400 text-sm ml-2">{t(`value.items.${key}.desc`)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* INDUSTRIES GRID */}
        <section className="py-20 px-4 bg-gray-900" aria-labelledby="industries-title">
          <div className="max-w-5xl mx-auto">
            <h2 id="industries-title" className="text-3xl md:text-4xl font-extrabold text-center mb-4">
              {t('industries.title')}
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              {t('industries.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {industries.map((industry) => (
                <span
                  key={industry}
                  className="bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-full hover:border-yellow-400/50 hover:text-yellow-400 transition-colors"
                >
                  {t(`industries.list.${industry}`)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* COST COMPARISON */}
        <section className="py-20 px-4" aria-labelledby="comparison-title">
          <div className="max-w-4xl mx-auto">
            <h2 id="comparison-title" className="text-3xl md:text-4xl font-extrabold text-center mb-4">
              {t('comparison.title')}
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              {t('comparison.subtitle')}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Others */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-red-400 mb-6">{t('comparison.others.title')}</h3>
                <ul className="space-y-4">
                  {(['price', 'data', 'contracts', 'industries'] as const).map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <X className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-400">{t(`comparison.others.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* IndustryDB */}
              <div className="bg-gray-900 border border-yellow-400/30 rounded-2xl p-8 relative">
                <div className="absolute -top-3 left-6">
                  <span className="bg-yellow-400 text-gray-950 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    IndustryDB
                  </span>
                </div>
                <h3 className="text-lg font-bold text-yellow-400 mb-6">{t('comparison.us.title')}</h3>
                <ul className="space-y-4">
                  {(['price', 'data', 'contracts', 'industries'] as const).map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-300">{t(`comparison.us.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING - Value-anchored */}
        <section className="py-20 px-4 bg-gray-900" aria-labelledby="pricing-title">
          <div className="max-w-7xl mx-auto">
            <h2 id="pricing-title" className="text-3xl md:text-4xl font-extrabold text-center mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-center text-gray-400 mb-12">
              {t('pricing.subtitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative bg-gray-950 rounded-2xl p-6 border ${
                    tier.popular
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/10 scale-[1.02]'
                      : 'border-gray-800'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-yellow-400 text-gray-950 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {t('mostPopular')}
                      </span>
                    </div>
                  )}
                  <div className="text-center pb-4">
                    <h3 className="text-lg font-bold text-white">{t(`pricing.${tier.id}.name`)}</h3>
                    <div className="mt-3">
                      <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                      {tier.price !== '$0' && <span className="text-gray-400">/mo</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {tier.leads} {t('leadsPerMonth')}
                    </p>
                    {tier.price !== '$0' && (
                      <p className="text-xs text-yellow-400/80 mt-1">
                        {t('costPer')}: {tier.costPerLead}/{t('lead')}
                      </p>
                    )}
                  </div>
                  <Link href="/register">
                    <Button
                      className={`w-full font-bold ${
                        tier.popular
                          ? 'bg-yellow-400 text-gray-950 hover:bg-yellow-300'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      {tCommon('getStarted')}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/pricing" className="text-yellow-400 hover:text-yellow-300 font-medium text-sm">
                {t('viewFullPricing')} →
              </Link>
            </div>
          </div>
        </section>

        {/* GUARANTEE */}
        <section className="py-16 px-4" aria-labelledby="guarantee-title">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-yellow-400" aria-hidden="true" />
            </div>
            <h2 id="guarantee-title" className="text-2xl md:text-3xl font-extrabold mb-4">
              {t('guarantee.title')}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {t('guarantee.desc')}
            </p>
          </div>
        </section>

        {/* FINAL CTA - Strong close */}
        <section className="py-20 px-4 bg-yellow-400" aria-labelledby="cta-title">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="cta-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-950 mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-gray-800 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-gray-950 text-yellow-400 hover:bg-gray-900 font-bold text-lg px-10 py-6 h-auto">
                {t('cta.button')}
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-700">
              {t('freeLeadsNote')}
            </p>
          </div>
        </section>
      </main>

      {/* Footer - Dark */}
      <footer className="bg-gray-950 text-gray-400 border-t border-gray-800" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4">
                <Database className="h-8 w-8 text-yellow-400" aria-hidden="true" />
                <span className="ml-2 text-xl font-bold text-white">IndustryDB</span>
              </div>
              <p className="text-sm text-gray-500">
                {tFooter('description')}
              </p>
            </div>

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

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {tFooter('legal')}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                    {t('privacyPolicy')}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm hover:text-white transition-colors">
                    {t('termsOfService')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500 text-center">
              © {currentYear} IndustryDB. {tFooter('allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>

      <CookieConsentBanner />
    </div>
  )
}
