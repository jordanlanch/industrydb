'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Building2, Shield, TrendingUp, Sparkles } from 'lucide-react'
import type { UsageInfo } from '@/types'

interface EmptySearchStateProps {
  usage: UsageInfo | null
  onQuickSearch?: (industry: string, country: string) => void
}

export function EmptySearchState({ usage, onQuickSearch }: EmptySearchStateProps) {
  const quickSearchExamples = [
    { industry: 'tattoo', country: 'US', label: '🎨 Tattoo Studios in USA' },
    { industry: 'beauty', country: 'GB', label: '💅 Beauty Salons in UK' },
    { industry: 'gym', country: 'ES', label: '💪 Gyms in Spain' },
    { industry: 'restaurant', country: 'DE', label: '🍽️ Restaurants in Germany' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 max-w-3xl mx-auto">
      {/* Hero Icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
        <Search className="h-10 w-10 text-primary" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-2">Search for Business Leads</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Apply filters and click <strong>Search</strong> to discover verified business leads in your target industry.
      </p>

      {/* How It Works */}
      <Card className="w-full mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            How it works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-sm">Select Your Filters</p>
                <p className="text-xs text-muted-foreground">Choose industry, location, and data quality preferences</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-sm">Click Search</p>
                <p className="text-xs text-muted-foreground">Each search uses <strong>1 credit</strong> from your monthly allowance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-sm">Browse & Export</p>
                <p className="text-xs text-muted-foreground">View results, paginate freely, and export without extra charges</p>
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
            <p className="text-sm font-medium mb-1">1 Search = 1 Credit</p>
            <p className="text-xs text-muted-foreground">Simple, transparent pricing</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium mb-1">Pagination is Free</p>
            <p className="text-xs text-muted-foreground">Browse all results without extra charges</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium mb-1">Verified Data</p>
            <p className="text-xs text-muted-foreground">High-quality, up-to-date leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Info */}
      {usage && (
        <div className="w-full p-4 rounded-lg bg-gray-50 border mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your Monthly Allowance</span>
            <Badge variant={usage.remaining <= 10 ? 'destructive' : 'secondary'}>
              {usage.remaining} / {usage.usage_limit} searches
            </Badge>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usage.remaining === 0
                  ? 'bg-red-500'
                  : usage.remaining <= 5
                  ? 'bg-yellow-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${((usage.usage_limit - usage.remaining) / usage.usage_limit) * 100}%` }}
            />
          </div>
          {usage.reset_at && (
            <p className="text-xs text-muted-foreground mt-2">
              Resets on {new Date(usage.reset_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
      )}

      {/* Quick Search Examples */}
      {onQuickSearch && (
        <div className="w-full">
          <p className="text-sm font-medium mb-3 text-center">Quick Start Examples</p>
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
