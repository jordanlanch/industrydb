/**
 * Sub-Niche Landing Page
 * Dynamic page for specific sub-niches (e.g., /industries/restaurant/italian)
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SubNicheBadge, SubNicheBadgeCompact } from '@/components/leads/sub-niche-badge'
import {
  Search,
  MapPin,
  TrendingUp,
  Star,
  ArrowRight,
  Users,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

interface SubNicheData {
  id: string
  name: string
  industryId: string
  industryName: string
  description: string
  totalLeads: number
  verifiedLeads: number
  averageQuality: number
  topCities: Array<{ city: string; country: string; count: number }>
  relatedSubNiches: Array<{ id: string; name: string }>
  popularSpecialties: string[]
  qualityDistribution: { high: number; medium: number; low: number }
}

export default function SubNichePage() {
  const params = useParams()
  const router = useRouter()
  const industryId = params.id as string
  const subNicheId = params.subniche as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SubNicheData | null>(null)

  useEffect(() => {
    loadSubNicheData()
  }, [industryId, subNicheId])

  const loadSubNicheData = async () => {
    // Mock data - in production, fetch from API
    const mockData: Record<string, Record<string, SubNicheData>> = {
      restaurant: {
        italian: {
          id: 'italian',
          name: 'Italian Restaurants',
          industryId: 'restaurant',
          industryName: 'Restaurants',
          description: 'Discover authentic Italian restaurants serving pasta, pizza, risotto, and other traditional Italian cuisine.',
          totalLeads: 3500,
          verifiedLeads: 2950,
          averageQuality: 85,
          topCities: [
            { city: 'New York', country: 'US', count: 542 },
            { city: 'Los Angeles', country: 'US', count: 398 },
            { city: 'Chicago', country: 'US', count: 287 },
            { city: 'Boston', country: 'US', count: 234 },
            { city: 'San Francisco', country: 'US', count: 198 },
          ],
          relatedSubNiches: [
            { id: 'pizza', name: 'Pizza' },
            { id: 'mediterranean', name: 'Mediterranean' },
            { id: 'french', name: 'French' },
          ],
          popularSpecialties: ['Pasta', 'Pizza', 'Seafood', 'Fine Dining', 'Outdoor Seating', 'Wine Bar'],
          qualityDistribution: { high: 65, medium: 28, low: 7 },
        },
        mexican: {
          id: 'mexican',
          name: 'Mexican Restaurants',
          industryId: 'restaurant',
          industryName: 'Restaurants',
          description: 'Find Mexican restaurants serving tacos, burritos, enchiladas, and authentic Mexican cuisine.',
          totalLeads: 3000,
          verifiedLeads: 2400,
          averageQuality: 80,
          topCities: [
            { city: 'Los Angeles', country: 'US', count: 678 },
            { city: 'Austin', country: 'US', count: 456 },
            { city: 'San Diego', country: 'US', count: 334 },
            { city: 'Houston', country: 'US', count: 298 },
            { city: 'Phoenix', country: 'US', count: 245 },
          ],
          relatedSubNiches: [
            { id: 'tex_mex', name: 'Tex-Mex' },
            { id: 'latin', name: 'Latin American' },
            { id: 'spanish', name: 'Spanish' },
          ],
          popularSpecialties: ['Tacos', 'Burritos', 'Delivery', 'Takeout', 'Margaritas', 'Outdoor Seating'],
          qualityDistribution: { high: 55, medium: 35, low: 10 },
        },
      },
      gym: {
        crossfit: {
          id: 'crossfit',
          name: 'CrossFit Gyms',
          industryId: 'gym',
          industryName: 'Gyms',
          description: 'Access CrossFit gym data with certified trainers, Olympic lifting equipment, and group classes.',
          totalLeads: 2500,
          verifiedLeads: 2100,
          averageQuality: 88,
          topCities: [
            { city: 'Los Angeles', country: 'US', count: 334 },
            { city: 'Austin', country: 'US', count: 287 },
            { city: 'Denver', country: 'US', count: 234 },
            { city: 'San Diego', country: 'US', count: 198 },
            { city: 'Portland', country: 'US', count: 176 },
          ],
          relatedSubNiches: [
            { id: 'fitness', name: 'Traditional Gym' },
            { id: 'boxing', name: 'Boxing/MMA' },
            { id: 'functional', name: 'Functional Training' },
          ],
          popularSpecialties: ['Personal Training', 'Group Classes', 'Olympic Lifting', 'Nutrition Coaching'],
          qualityDistribution: { high: 75, medium: 20, low: 5 },
        },
      },
    }

    setTimeout(() => {
      const industry = mockData[industryId]
      setData(industry ? industry[subNicheId] : null)
      setLoading(false)
    }, 300)
  }

  const handleSearchCity = (city: string, country: string) => {
    sessionStorage.setItem('leadFilters', JSON.stringify({
      selections: [{
        industryId,
        industryName: data?.industryName,
        subNicheId,
        subNicheName: data?.name,
      }],
      city,
      country,
    }))
    router.push('/dashboard/leads')
  }

  const handleSearchAll = () => {
    sessionStorage.setItem('leadFilters', JSON.stringify({
      selections: [{
        industryId,
        industryName: data?.industryName,
        subNicheId,
        subNicheName: data?.name,
      }],
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
          <h1 className="text-3xl font-bold mb-4">Sub-Niche Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The sub-niche you're looking for doesn't exist or hasn't been added yet.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/industries/${industryId}`}>
              <Button>Back to {industryId}</Button>
            </Link>
            <Link href="/dashboard/leads">
              <Button variant="outline">Browse All</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/industries/${data.industryId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {data.industryName}
            </Link>
          </div>

          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="mb-4">
                <SubNicheBadge
                  industryId={data.industryId}
                  industryName={data.industryName}
                  subNicheName={data.name}
                  size="lg"
                  showIcon={true}
                />
              </div>
              <h1 className="text-4xl font-bold mb-3">{data.name}</h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                {data.description}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Button size="lg" onClick={handleSearchAll}>
                  <Search className="mr-2 h-5 w-5" />
                  Search All {data.name}
                </Button>
                <Link href={`/industries/${data.industryId}`}>
                  <Button variant="outline" size="lg">
                    View All {data.industryName}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totalLeads.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.verifiedLeads.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.averageQuality}/100</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Quality</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.qualityDistribution.high}%</div>
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

          {/* Quality Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Quality Distribution
              </CardTitle>
              <CardDescription>Data quality breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">High Quality (70-100)</span>
                  <span className="text-sm font-bold text-green-600">
                    {data.qualityDistribution.high}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${data.qualityDistribution.high}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Medium Quality (40-69)</span>
                  <span className="text-sm font-bold text-yellow-600">
                    {data.qualityDistribution.medium}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full"
                    style={{ width: `${data.qualityDistribution.medium}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Low Quality (0-39)</span>
                  <span className="text-sm font-bold text-red-600">
                    {data.qualityDistribution.low}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: `${data.qualityDistribution.low}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Specialties */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Popular Specialties</CardTitle>
            <CardDescription>Common features in {data.name.toLowerCase()}</CardDescription>
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

        {/* Related Sub-Niches */}
        {data.relatedSubNiches && data.relatedSubNiches.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Related Categories</CardTitle>
              <CardDescription>Similar types you might be interested in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {data.relatedSubNiches.map((related) => (
                  <Link
                    key={related.id}
                    href={`/industries/${data.industryId}/${related.id}`}
                  >
                    <Button variant="outline">
                      {related.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Access {data.name} Data?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Search {data.totalLeads.toLocaleString()} verified {data.name.toLowerCase()} with {data.qualityDistribution.high}% high-quality data.
            </p>
            <div className="flex justify-center gap-3">
              <Button size="lg" onClick={handleSearchAll}>
                <Search className="mr-2 h-5 w-5" />
                Start Searching
              </Button>
              <Link href={`/industries/${data.industryId}`}>
                <Button variant="outline" size="lg">
                  View All {data.industryName}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
