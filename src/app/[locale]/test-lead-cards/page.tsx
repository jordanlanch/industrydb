/**
 * Test page for Enhanced Lead Cards
 * Visual test of lead cards with sub-niche badges and specialty tags
 */
'use client'

import { useState } from 'react'
import { LeadCard, LeadGroupHeader } from '@/components/leads/lead-card'
import { SubNicheBadge, SubNicheBadgeCompact } from '@/components/leads/sub-niche-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import type { Lead } from '@/types'
import { Layers } from 'lucide-react'

export default function TestLeadCardsPage() {
  const [groupBySubNiche, setGroupBySubNiche] = useState(false)

  // Sample leads with sub-niche data
  const sampleLeads: Lead[] = [
    {
      id: 1,
      name: "Bella Italia Ristorante",
      industry: "restaurant",
      sub_niche: "italian",
      cuisine_type: "italian",
      specialties: ["Pasta", "Seafood", "Fine Dining", "Outdoor Seating", "WiFi"],
      country: "US",
      city: "New York",
      phone: "+1-212-555-0123",
      email: "info@bellaitalia.com",
      website: "https://bellaitalia.com",
      address: "123 Main St",
      verified: true,
      quality_score: 87,
      created_at: "2024-01-15T10:00:00Z",
    },
    {
      id: 2,
      name: "Taco Loco",
      industry: "restaurant",
      sub_niche: "mexican",
      cuisine_type: "mexican",
      specialties: ["Tacos", "Burritos", "Delivery", "Takeout", "Vegetarian"],
      country: "US",
      city: "Los Angeles",
      phone: "+1-323-555-0456",
      email: "orders@tacoloco.com",
      website: "https://tacoloco.com",
      verified: false,
      quality_score: 72,
      created_at: "2024-01-16T11:00:00Z",
    },
    {
      id: 3,
      name: "Sushi Master",
      industry: "restaurant",
      sub_niche: "japanese",
      cuisine_type: "japanese",
      specialties: ["Sushi", "Ramen", "Sake Bar", "Omakase"],
      country: "US",
      city: "San Francisco",
      phone: "+1-415-555-0789",
      website: "https://sushimaster.com",
      verified: true,
      quality_score: 95,
      created_at: "2024-01-17T12:00:00Z",
    },
    {
      id: 4,
      name: "CrossFit Central",
      industry: "gym",
      sub_niche: "crossfit",
      sport_type: "crossfit",
      specialties: ["Personal Training", "Group Classes", "Olympic Lifting"],
      country: "US",
      city: "Austin",
      phone: "+1-512-555-0321",
      email: "info@crossfitcentral.com",
      website: "https://crossfitcentral.com",
      verified: true,
      quality_score: 88,
      created_at: "2024-01-18T13:00:00Z",
    },
    {
      id: 5,
      name: "Zen Yoga Studio",
      industry: "gym",
      sub_niche: "yoga",
      sport_type: "yoga",
      specialties: ["Vinyasa", "Hot Yoga", "Meditation", "Workshops"],
      country: "US",
      city: "Portland",
      email: "hello@zenyoga.com",
      website: "https://zenyoga.com",
      verified: false,
      quality_score: 65,
      created_at: "2024-01-19T14:00:00Z",
    },
    {
      id: 6,
      name: "Ink Masters Tattoo",
      industry: "tattoo",
      sub_niche: "japanese",
      tattoo_style: "japanese",
      specialties: ["Irezumi", "Custom Designs", "Cover-ups"],
      country: "US",
      city: "Seattle",
      phone: "+1-206-555-0654",
      email: "art@inkmasters.com",
      verified: true,
      quality_score: 82,
      created_at: "2024-01-20T15:00:00Z",
    },
    {
      id: 7,
      name: "Generic Diner",
      industry: "restaurant",
      country: "US",
      city: "Chicago",
      phone: "+1-312-555-0987",
      verified: false,
      quality_score: 45,
      created_at: "2024-01-21T16:00:00Z",
    },
  ]

  // Group leads by sub-niche
  const groupedLeads = () => {
    const groups: Record<string, Lead[]> = {}

    sampleLeads.forEach((lead) => {
      const subNiche = lead.cuisine_type || lead.sport_type || lead.tattoo_style || lead.sub_niche || 'Other'
      if (!groups[subNiche]) {
        groups[subNiche] = []
      }
      groups[subNiche].push(lead)
    })

    return Object.entries(groups).sort(([, a], [, b]) => b.length - a.length)
  }

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copied: ${text}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Enhanced Lead Cards
          </h1>
          <p className="text-lg text-gray-600">
            Lead cards with sub-niche badges, specialty tags, and quality indicators
          </p>
        </div>

        {/* Test Scenarios */}
        <Tabs defaultValue="default" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="default">Default View</TabsTrigger>
            <TabsTrigger value="grouped">Grouped View</TabsTrigger>
            <TabsTrigger value="compact">Compact Mode</TabsTrigger>
            <TabsTrigger value="badges">Badge Components</TabsTrigger>
          </TabsList>

          {/* Default View */}
          <TabsContent value="default" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Lead Cards</CardTitle>
                <CardDescription>
                  Standard view with all information displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onCopyText={handleCopyText}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grouped View */}
          <TabsContent value="grouped" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Grouped by Sub-Niche</CardTitle>
                    <CardDescription>
                      Leads organized by their sub-niche category
                    </CardDescription>
                  </div>
                  <Button
                    variant={groupBySubNiche ? 'default' : 'outline'}
                    onClick={() => setGroupBySubNiche(!groupBySubNiche)}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    {groupBySubNiche ? 'Grouped' : 'Flat View'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {groupBySubNiche ? (
                  <div className="space-y-6">
                    {groupedLeads().map(([subNiche, groupLeads]) => (
                      <div key={subNiche} className="border rounded-lg overflow-hidden">
                        <LeadGroupHeader
                          title={subNiche.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          count={groupLeads.length}
                        />
                        <div className="p-4 space-y-4">
                          {groupLeads.map((lead) => (
                            <LeadCard
                              key={lead.id}
                              lead={lead}
                              onCopyText={handleCopyText}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sampleLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onCopyText={handleCopyText}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compact Mode */}
          <TabsContent value="compact" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Default Size</CardTitle>
                  <CardDescription>Full lead card with all details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sampleLeads.slice(0, 2).map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onCopyText={handleCopyText}
                      variant="default"
                    />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compact Size</CardTitle>
                  <CardDescription>Condensed view for lists/sidebars</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sampleLeads.slice(0, 4).map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onCopyText={handleCopyText}
                      variant="compact"
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Badge Components */}
          <TabsContent value="badges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sub-Niche Badge Components</CardTitle>
                <CardDescription>
                  Standalone badge components for sub-niches and specialties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SubNicheBadge Examples */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">SubNicheBadge (with industry context)</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Restaurant - Italian</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <SubNicheBadge
                          industryId="restaurant"
                          industryName="Restaurant"
                          subNicheName="Italian"
                          size="sm"
                        />
                        <SubNicheBadge
                          industryId="restaurant"
                          industryName="Restaurant"
                          subNicheName="Italian"
                          size="md"
                        />
                        <SubNicheBadge
                          industryId="restaurant"
                          industryName="Restaurant"
                          subNicheName="Italian"
                          size="lg"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Gym - CrossFit</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <SubNicheBadge
                          industryId="gym"
                          industryName="Gym"
                          subNicheName="CrossFit"
                          variant="default"
                        />
                        <SubNicheBadge
                          industryId="gym"
                          industryName="Gym"
                          subNicheName="CrossFit"
                          variant="secondary"
                        />
                        <SubNicheBadge
                          industryId="gym"
                          industryName="Gym"
                          subNicheName="CrossFit"
                          variant="outline"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Tattoo - Japanese</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <SubNicheBadge
                          industryId="tattoo"
                          industryName="Tattoo Studio"
                          subNicheName="Japanese Irezumi"
                          showIcon={true}
                        />
                        <SubNicheBadge
                          industryId="tattoo"
                          industryName="Tattoo Studio"
                          subNicheName="Japanese Irezumi"
                          showIcon={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SubNicheBadgeCompact Examples */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">SubNicheBadgeCompact (specialty tags)</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Restaurant Specialties</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <SubNicheBadgeCompact subNicheName="Pasta" />
                        <SubNicheBadgeCompact subNicheName="Seafood" />
                        <SubNicheBadgeCompact subNicheName="Fine Dining" />
                        <SubNicheBadgeCompact subNicheName="Outdoor Seating" />
                        <SubNicheBadgeCompact subNicheName="WiFi" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Gym Amenities</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <SubNicheBadgeCompact subNicheName="Personal Training" variant="default" />
                        <SubNicheBadgeCompact subNicheName="Group Classes" variant="default" />
                        <SubNicheBadgeCompact subNicheName="24 Hours" variant="default" />
                        <SubNicheBadgeCompact subNicheName="Showers" variant="default" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Tattoo Services</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <SubNicheBadgeCompact subNicheName="Custom Designs" variant="secondary" />
                        <SubNicheBadgeCompact subNicheName="Cover-ups" variant="secondary" />
                        <SubNicheBadgeCompact subNicheName="Touch-ups" variant="secondary" />
                      </div>
                    </div>
                  </div>
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
                <h3 className="font-semibold text-sm mb-2">✅ Sub-Niche Badges</h3>
                <p className="text-xs text-muted-foreground">
                  Display cuisine type, gym type, or tattoo style with icons
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Specialty Tags</h3>
                <p className="text-xs text-muted-foreground">
                  Show business specialties as compact badges
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Enhanced Quality Display</h3>
                <p className="text-xs text-muted-foreground">
                  Progress bar, badge, and numeric score
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Grouped View</h3>
                <p className="text-xs text-muted-foreground">
                  Group leads by sub-niche category
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Compact Mode</h3>
                <p className="text-xs text-muted-foreground">
                  Condensed variant for dense layouts
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Copy to Clipboard</h3>
                <p className="text-xs text-muted-foreground">
                  Quick copy buttons for contact info
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Completeness Indicators</h3>
                <p className="text-xs text-muted-foreground">
                  Visual indicators for data completeness
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Verified Badge</h3>
                <p className="text-xs text-muted-foreground">
                  Highlight verified business data
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">✅ Professional Icons</h3>
                <p className="text-xs text-muted-foreground">
                  Lucide icons integrated with sub-niche badges
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Test page for Enhanced Lead Cards • Integrated with professional icon system
          </p>
        </div>
      </div>
    </div>
  )
}
