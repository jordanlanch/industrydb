/**
 * Test page for IndustrySelectorV2
 * Visual test of the 3-panel industry selector
 */
'use client'

import { useState } from 'react'
import { IndustrySelectorV2, type IndustrySelection } from '@/components/leads/industry-selector-v2'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TestSelectorPage() {
  // State for different scenarios
  const [singleSelection, setSingleSelection] = useState<IndustrySelection[]>([])
  const [multiSelection, setMultiSelection] = useState<IndustrySelection[]>([])
  const [tieredSelection, setTieredSelection] = useState<IndustrySelection[]>([])
  const [compactSelection, setCompactSelection] = useState<IndustrySelection[]>([])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            IndustrySelector V2
          </h1>
          <p className="text-lg text-gray-600">
            3-Panel Layout with Sub-Niches, Search, and Lead Counts
          </p>
        </div>

        {/* Test Scenarios */}
        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="single">Single Select</TabsTrigger>
            <TabsTrigger value="multi">Multi Select</TabsTrigger>
            <TabsTrigger value="tiered">Tier Limits</TabsTrigger>
            <TabsTrigger value="compact">Compact Mode</TabsTrigger>
          </TabsList>

          {/* Single Select Mode */}
          <TabsContent value="single" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Single Select Mode</CardTitle>
                <CardDescription>
                  Select one industry and optionally one sub-niche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IndustrySelectorV2
                  selections={singleSelection}
                  onChange={setSingleSelection}
                  multiSelect={false}
                  showCounts={true}
                />

                {/* Debug Output */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Debug Output:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(singleSelection, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multi Select Mode */}
          <TabsContent value="multi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Multi Select Mode</CardTitle>
                <CardDescription>
                  Select multiple industries and sub-niches (unlimited)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IndustrySelectorV2
                  selections={multiSelection}
                  onChange={setMultiSelection}
                  multiSelect={true}
                  showCounts={true}
                />

                {/* Debug Output */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">
                    Selected: {multiSelection.length}
                  </h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(multiSelection, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tier Limits */}
          <TabsContent value="tiered" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Free Tier */}
              <Card className="border-2 border-gray-300">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">Free</Badge>
                  <CardTitle className="text-lg">1 Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <IndustrySelectorV2
                    selections={tieredSelection.slice(0, 1)}
                    onChange={(sels) => setTieredSelection(sels)}
                    multiSelect={true}
                    maxSelections={1}
                    showCounts={true}
                    compact={true}
                  />
                </CardContent>
              </Card>

              {/* Pro Tier */}
              <Card className="border-2 border-blue-500">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-blue-500">Pro</Badge>
                  <CardTitle className="text-lg">3 Selections</CardTitle>
                </CardHeader>
                <CardContent>
                  <IndustrySelectorV2
                    selections={tieredSelection}
                    onChange={setTieredSelection}
                    multiSelect={true}
                    maxSelections={3}
                    showCounts={true}
                    compact={true}
                  />
                </CardContent>
              </Card>

              {/* Business Tier */}
              <Card className="border-2 border-purple-500">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-purple-500">Business</Badge>
                  <CardTitle className="text-lg">Unlimited</CardTitle>
                </CardHeader>
                <CardContent>
                  <IndustrySelectorV2
                    selections={tieredSelection}
                    onChange={setTieredSelection}
                    multiSelect={true}
                    showCounts={true}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Shared Selection Display */}
            <Card>
              <CardHeader>
                <CardTitle>Current Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">
                    Selected: {tieredSelection.length}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tieredSelection.map((sel, idx) => (
                      <Badge key={idx} variant="secondary">
                        {sel.subNicheName
                          ? `${sel.industryName} · ${sel.subNicheName}`
                          : sel.industryName}
                      </Badge>
                    ))}
                  </div>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(tieredSelection, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compact Mode */}
          <TabsContent value="compact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compact Mode</CardTitle>
                <CardDescription>
                  Smaller variant for tight spaces (sidebars, modals)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Normal Size</h3>
                    <IndustrySelectorV2
                      selections={compactSelection}
                      onChange={setCompactSelection}
                      multiSelect={true}
                      showCounts={true}
                      compact={false}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Compact Size</h3>
                    <IndustrySelectorV2
                      selections={compactSelection}
                      onChange={setCompactSelection}
                      multiSelect={true}
                      showCounts={true}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Debug Output */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">
                    Selected: {compactSelection.length}
                  </h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(compactSelection, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ 3-Panel Layout</h3>
                <p className="text-xs text-muted-foreground">
                  Categories → Industries → Sub-Niches side-by-side on desktop
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Responsive Design</h3>
                <p className="text-xs text-muted-foreground">
                  Tabs on mobile, panels on desktop
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Search Functionality</h3>
                <p className="text-xs text-muted-foreground">
                  Search across industries and sub-niches
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Lead Counts</h3>
                <p className="text-xs text-muted-foreground">
                  Real-time counts from database
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Multi-Select</h3>
                <p className="text-xs text-muted-foreground">
                  Select multiple industries and sub-niches
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Tier Limits</h3>
                <p className="text-xs text-muted-foreground">
                  Free: 1, Pro: 3, Business: Unlimited
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Professional Icons</h3>
                <p className="text-xs text-muted-foreground">
                  Lucide React icons (no emojis)
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Compact Mode</h3>
                <p className="text-xs text-muted-foreground">
                  Smaller variant for sidebars
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Popular Badges</h3>
                <p className="text-xs text-muted-foreground">
                  Highlights trending sub-niches
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Test page for IndustrySelectorV2 • Backend API:{' '}
            <code className="bg-gray-200 px-1 rounded">
              GET /api/v1/industries/:id/sub-niches
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}
