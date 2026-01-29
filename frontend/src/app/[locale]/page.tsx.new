'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Zap, Shield, DollarSign, Check } from 'lucide-react'

export default function HomePage() {
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
      "priceSpecification": [
        {
          "@type": "UnitPriceSpecification",
          "price": "0",
          "priceCurrency": "USD",
          "name": "Free Plan"
        },
        {
          "@type": "UnitPriceSpecification",
          "price": "49",
          "priceCurrency": "USD",
          "name": "Starter Plan"
        },
        {
          "@type": "UnitPriceSpecification",
          "price": "149",
          "priceCurrency": "USD",
          "name": "Pro Plan"
        },
        {
          "@type": "UnitPriceSpecification",
          "price": "349",
          "priceCurrency": "USD",
          "name": "Business Plan"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "100"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">IndustryDB</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Industry-Specific Business Data
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Access verified local business data by industry. Affordable leads for tattoo studios,
              beauty salons, gyms, restaurants, and more.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              50 free leads per month. No credit card required.
            </p>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose IndustryDB?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardHeader>
                  <Database className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Verified Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All business data is verified and regularly updated for accuracy
                  </p>
                </CardContent>
              </Card>

              <Card>
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

              <Card>
                <CardHeader>
                  <DollarSign className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Affordable</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Starting at just $49/month for 500 leads. Best value in the market
                  </p>
                </CardContent>
              </Card>

              <Card>
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

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Simple, Transparent Pricing
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Free',
                  price: 0,
                  leads: 50,
                  features: ['50 leads/month', 'Basic data fields', 'CSV export'],
                },
                {
                  name: 'Starter',
                  price: 49,
                  leads: 500,
                  features: ['500 leads/month', 'Phone & Address', 'CSV & Excel export', 'Email support'],
                  popular: true,
                },
                {
                  name: 'Pro',
                  price: 149,
                  leads: 2000,
                  features: ['2,000 leads/month', 'Email & Social media', 'Priority export', 'Priority support'],
                },
                {
                  name: 'Business',
                  price: 349,
                  leads: 10000,
                  features: ['10,000 leads/month', 'Full data access', 'API access', 'Dedicated support'],
                },
              ].map((tier) => (
                <Card key={tier.name} className={tier.popular ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-6">
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/register">
                      <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of businesses accessing quality leads every day
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 IndustryDB. All rights reserved.</p>
          <p className="mt-2 text-sm">Industry-specific business data. Verified. Affordable.</p>
        </div>
      </footer>
    </div>
  )
}
