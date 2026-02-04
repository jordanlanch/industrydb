/**
 * Industry Landing Page
 * Dynamic page for specific industries (e.g., /industries/restaurant)
 */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IndustryIcon } from '@/components/industry-icon'
import { SubNicheBadgeCompact } from '@/components/leads/sub-niche-badge'
import {
  Search,
  MapPin,
  TrendingUp,
  Star,
  ArrowRight,
  Users,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'

interface IndustryData {
  id: string
  name: string
  description: string
  totalLeads: number
  verifiedLeads: number
  averageQuality: number
  topCities: Array<{ city: string; country: string; count: number }>
  topSubNiches: Array<{ id: string; name: string; count: number }>
  popularSpecialties: string[]
}

export default function IndustryPage() {
  const params = useParams()
  const router = useRouter()
  const industryId = params.id as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<IndustryData | null>(null)

  useEffect(() => {
    loadIndustryData()
  }, [industryId])

  const loadIndustryData = async () => {
    // Mock data - in production, fetch from API
    const mockData: Record<string, IndustryData> = {
      restaurant: {
        id: 'restaurant',
        name: 'Restaurants',
        description: 'Discover verified restaurant data across 40+ cuisine types including Italian, Mexican, Japanese, and more.',
        totalLeads: 30000,
        verifiedLeads: 24500,
        averageQuality: 82,
        topCities: [
          { city: 'New York', country: 'US', count: 4521 },
          { city: 'Los Angeles', country: 'US', count: 3892 },
          { city: 'Chicago', country: 'US', count: 2314 },
          { city: 'London', country: 'GB', count: 1987 },
          { city: 'Toronto', country: 'CA', count: 1456 },
        ],
        topSubNiches: [
          { id: 'italian', name: 'Italian', count: 3500 },
          { id: 'mexican', name: 'Mexican', count: 3000 },
          { id: 'japanese', name: 'Japanese', count: 2500 },
          { id: 'chinese', name: 'Chinese', count: 2500 },
          { id: 'thai', name: 'Thai', count: 2000 },
        ],
        popularSpecialties: ['Outdoor Seating', 'Delivery', 'Takeout', 'WiFi', 'Parking', 'Vegetarian'],
      },
      gym: {
        id: 'gym',
        name: 'Gyms & Fitness Centers',
        description: 'Access verified gym and fitness center data including CrossFit, yoga studios, traditional gyms, and more.',
        totalLeads: 12000,
        verifiedLeads: 9800,
        averageQuality: 78,
        topCities: [
          { city: 'Los Angeles', country: 'US', count: 1892 },
          { city: 'New York', country: 'US', count: 1756 },
          { city: 'Chicago', country: 'US', count: 1234 },
          { city: 'Austin', country: 'US', count: 987 },
          { city: 'London', country: 'GB', count: 876 },
        ],
        topSubNiches: [
          { id: 'crossfit', name: 'CrossFit', count: 2500 },
          { id: 'yoga', name: 'Yoga Studio', count: 2000 },
          { id: 'fitness', name: 'Traditional Gym', count: 3000 },
          { id: 'pilates', name: 'Pilates', count: 1500 },
          { id: 'boxing', name: 'Boxing/MMA', count: 1500 },
        ],
        popularSpecialties: ['Personal Training', '24 Hours', 'Group Classes', 'Showers', 'Sauna', 'Pool'],
      },
      tattoo: {
        id: 'tattoo',
        name: 'Tattoo Studios',
        description: 'Find verified tattoo studios specializing in Japanese, traditional, watercolor, realism, and other styles.',
        totalLeads: 8000,
        verifiedLeads: 6800,
        averageQuality: 85,
        topCities: [
          { city: 'Los Angeles', country: 'US', count: 1234 },
          { city: 'New York', country: 'US', count: 1123 },
          { city: 'Austin', country: 'US', count: 678 },
          { city: 'Seattle', country: 'US', count: 567 },
          { city: 'Portland', country: 'US', count: 456 },
        ],
        topSubNiches: [
          { id: 'traditional', name: 'Traditional American', count: 1200 },
          { id: 'japanese', name: 'Japanese/Irezumi', count: 1000 },
          { id: 'realism', name: 'Realism', count: 1000 },
          { id: 'watercolor', name: 'Watercolor', count: 800 },
          { id: 'neo_traditional', name: 'Neo-Traditional', count: 900 },
        ],
        popularSpecialties: ['Walk-ins Welcome', 'Custom Designs', 'Cover-ups', 'Touch-ups', 'Piercing'],
      },
    }

    setTimeout(() => {
      setData(mockData[industryId] || null)
      setLoading(false)
    }, 300)
  }

  const handleSearchCity = (city: string, country: string) => {
    sessionStorage.setItem('leadFilters', JSON.stringify({
      selections: [{ industryId, industryName: data?.name }],
      city,
      country,
    }))
    router.push('/dashboard/leads')
  }

  const handleSearchSubNiche = (subNicheId: string, subNicheName: string) => {
    sessionStorage.setItem('leadFilters', JSON.stringify({
      selections: [{ industryId, industryName: data?.name, subNicheId, subNicheName }],
    }))
    router.push('/dashboard/leads')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-gray-200 rounded-lg" />
              <div className="h-24 bg-gray-200 rounded-lg" />
              <div className="h-24 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Industry Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The industry you're looking for doesn't exist or hasn't been added yet.
          </p>
          <Link href="/dashboard/leads">
            <Button>Browse All Industries</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start gap-6">
            <IndustryIcon
              industryId={data.id}
              size="xl"
              showBackground
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{data.name}</h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                {data.description}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/dashboard/leads">
                  <Button size="lg">
                    <Search className="mr-2 h-5 w-5" />
                    Search {data.name}
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalLeads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.verifiedLeads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((data.verifiedLeads / data.totalLeads) * 100).toFixed(0)}% verification rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.averageQuality}/100</div>
              <p className="text-xs text-muted-foreground mt-1">
                High-quality data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Cities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Top Cities
              </CardTitle>
              <CardDescription>Most popular locations for {data.name.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topCities.map((city, index) => (
                  <div
                    key={`${city.city}-${city.country}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border"
                    onClick={() => handleSearchCity(city.city, city.country)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{city.city}</div>
                        <div className="text-xs text-muted-foreground">{city.country}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{city.count.toLocaleString()} leads</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Sub-Niches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Popular Types
              </CardTitle>
              <CardDescription>Most searched sub-categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topSubNiches.map((subNiche, index) => (
                  <Link
                    key={subNiche.id}
                    href={`/industries/${data.id}/${subNiche.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="font-semibold">{subNiche.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{subNiche.count.toLocaleString()} leads</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Specialties */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Popular Specialties & Features</CardTitle>
            <CardDescription>Common attributes found in {data.name.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.popularSpecialties.map((specialty) => (
                <SubNicheBadgeCompact
                  key={specialty}
                  subNicheName={specialty}
                  size="md"
                  variant="secondary"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Access {data.name} Data?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Search {data.totalLeads.toLocaleString()} verified {data.name.toLowerCase()} across multiple countries and cities.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/dashboard/leads">
                <Button size="lg">
                  <Search className="mr-2 h-5 w-5" />
                  Start Searching
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
