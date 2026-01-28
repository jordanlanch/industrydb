/**
 * Test page for Advanced Filter Panel
 * Visual test of the comprehensive filter interface
 */
'use client'

import { useState } from 'react'
import { AdvancedFilterPanel, type FilterState } from '@/components/leads/advanced-filter-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TestFiltersPage() {
  // State for different scenarios
  const [basicFilters, setBasicFilters] = useState<FilterState>({
    selections: [],
  })

  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    selections: [],
  })

  const [prefilledFilters, setPrefilledFilters] = useState<FilterState>({
    selections: [
      {
        industryId: 'restaurant',
        industryName: 'Restaurants',
        subNicheId: 'italian',
        subNicheName: 'Italian',
      },
    ],
    country: 'US',
    city: 'New York',
    radius: 25,
    hasEmail: true,
    hasPhone: true,
    qualityScoreMin: 70,
    qualityScoreMax: 100,
    specialties: ['Outdoor Seating', 'Delivery', 'WiFi'],
  })

  const handleSearch = (filters: FilterState) => {
    console.log('Search with filters:', filters)
    alert('Search triggered! Check console for filters.')
  }

  const handleClear = (setFilters: (filters: FilterState) => void) => {
    setFilters({ selections: [] })
  }

  const handleSave = (filters: FilterState) => {
    console.log('Save search:', filters)
    alert('Save search triggered! Check console for filters.')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Advanced Filter Panel
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive filtering interface for lead search
          </p>
        </div>

        {/* Test Scenarios */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Usage</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
            <TabsTrigger value="prefilled">Pre-filled Example</TabsTrigger>
          </TabsList>

          {/* Basic Usage */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <AdvancedFilterPanel
                  filters={basicFilters}
                  onChange={setBasicFilters}
                  onSearch={() => handleSearch(basicFilters)}
                  onClear={() => handleClear(setBasicFilters)}
                  multiSelect={false}
                />
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Debug Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
                      {JSON.stringify(basicFilters, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Features */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <AdvancedFilterPanel
                  filters={advancedFilters}
                  onChange={setAdvancedFilters}
                  onSearch={() => handleSearch(advancedFilters)}
                  onClear={() => handleClear(setAdvancedFilters)}
                  onSave={() => handleSave(advancedFilters)}
                  multiSelect={true}
                  maxSelections={3}
                  showSaveButton={true}
                />
              </div>

              <div className="space-y-4">
                {/* Active Filters Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Filters Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Industry & Sub-niche */}
                    {advancedFilters.selections.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Industry:</h3>
                        <div className="flex flex-wrap gap-2">
                          {advancedFilters.selections.map((sel, idx) => (
                            <Badge key={idx} variant="secondary">
                              {sel.subNicheName
                                ? `${sel.industryName} · ${sel.subNicheName}`
                                : sel.industryName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {(advancedFilters.country || advancedFilters.city) && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Location:</h3>
                        <div className="flex flex-wrap gap-2">
                          {advancedFilters.city && (
                            <Badge variant="outline">{advancedFilters.city}</Badge>
                          )}
                          {advancedFilters.country && (
                            <Badge variant="outline">{advancedFilters.country}</Badge>
                          )}
                          {advancedFilters.radius && (
                            <Badge variant="outline">
                              {advancedFilters.radius} mi radius
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Data Quality */}
                    {(advancedFilters.hasEmail ||
                      advancedFilters.hasPhone ||
                      advancedFilters.hasWebsite ||
                      advancedFilters.verified) && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Requirements:</h3>
                        <div className="flex flex-wrap gap-2">
                          {advancedFilters.hasEmail && (
                            <Badge variant="outline">Has Email</Badge>
                          )}
                          {advancedFilters.hasPhone && (
                            <Badge variant="outline">Has Phone</Badge>
                          )}
                          {advancedFilters.hasWebsite && (
                            <Badge variant="outline">Has Website</Badge>
                          )}
                          {advancedFilters.verified && (
                            <Badge variant="outline">Verified</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quality Score */}
                    {(advancedFilters.qualityScoreMin !== undefined ||
                      advancedFilters.qualityScoreMax !== undefined) && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Quality Score:</h3>
                        <Badge variant="outline">
                          {advancedFilters.qualityScoreMin || 0} -{' '}
                          {advancedFilters.qualityScoreMax || 100}
                        </Badge>
                      </div>
                    )}

                    {/* Specialties */}
                    {advancedFilters.specialties &&
                      advancedFilters.specialties.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2">Specialties:</h3>
                          <div className="flex flex-wrap gap-2">
                            {advancedFilters.specialties.map((specialty, idx) => (
                              <Badge key={idx} variant="outline">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Debug Output */}
                <Card>
                  <CardHeader>
                    <CardTitle>Debug Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
                      {JSON.stringify(advancedFilters, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Pre-filled Example */}
          <TabsContent value="prefilled" className="space-y-4">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Example: Italian Restaurants in NYC
              </h3>
              <p className="text-sm text-blue-700">
                This filter is pre-filled with: Italian restaurant in New York, US,
                within 25 miles, with email and phone, quality score 70-100, and
                specialties for outdoor seating, delivery, and WiFi.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <AdvancedFilterPanel
                  filters={prefilledFilters}
                  onChange={setPrefilledFilters}
                  onSearch={() => handleSearch(prefilledFilters)}
                  onClear={() => handleClear(setPrefilledFilters)}
                  onSave={() => handleSave(prefilledFilters)}
                  multiSelect={true}
                  showSaveButton={true}
                />
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>API Query Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Query Parameters:</h4>
                        <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
{`GET /api/v1/leads?
industry=restaurant
&sub_niche=italian
&country=US
&city=New York
&has_email=true
&has_phone=true
&quality_score_min=70
&quality_score_max=100
&specialties=Outdoor Seating,Delivery,WiFi`}
                        </pre>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2">Full Filter Object:</h4>
                        <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
                          {JSON.stringify(prefilledFilters, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
                <h3 className="font-semibold text-sm mb-2">✅ Industry Selector</h3>
                <p className="text-xs text-muted-foreground">
                  Integrated IndustrySelectorV2 with 3-panel layout
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Location Filters</h3>
                <p className="text-xs text-muted-foreground">
                  Country, city, and radius filtering
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Data Quality</h3>
                <p className="text-xs text-muted-foreground">
                  Filter by email, phone, website, verified status
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Quality Score Range</h3>
                <p className="text-xs text-muted-foreground">
                  Dual-handle slider for score range (0-100)
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Specialty Tags</h3>
                <p className="text-xs text-muted-foreground">
                  Industry-specific tags (restaurant, gym, tattoo, beauty)
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Collapsible Sections</h3>
                <p className="text-xs text-muted-foreground">
                  Clean UI with expandable filter categories
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Save Search</h3>
                <p className="text-xs text-muted-foreground">
                  Optional save button for filter combinations
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Clear Filters</h3>
                <p className="text-xs text-muted-foreground">
                  One-click reset to default state
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Mobile Responsive</h3>
                <p className="text-xs text-muted-foreground">
                  Adapts to small screens with stacked layout
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Test page for Advanced Filter Panel • Integrated with IndustrySelectorV2
          </p>
        </div>
      </div>
    </div>
  )
}
