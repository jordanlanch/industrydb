'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { IndustryCategory, IndustryWithCount } from '@/types'
import { industriesService } from '@/services/industries.service'
import { ChevronDown, ChevronUp, Loader2, AlertCircle, TrendingUp, Search, X } from 'lucide-react'

// Popular industries shown at the top for quick access
const POPULAR_INDUSTRIES = [
  'tattoo',
  'beauty',
  'restaurant',
  'gym',
  'cafe',
  'barber',
]

interface IndustrySelectorProps {
  selectedIndustries: string[]
  onChange: (industries: string[]) => void
  multiSelect?: boolean
  country?: string
  city?: string
}

export function IndustrySelector({
  selectedIndustries,
  onChange,
  multiSelect = false,
  country,
  city,
}: IndustrySelectorProps) {
  const [categories, setCategories] = useState<IndustryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Reload industries when filters change
  useEffect(() => {
    loadIndustries()
  }, [country, city])

  const loadIndustries = async () => {
    try {
      setError(null)
      setLoading(true)
      // Fetch only industries with leads (with counts, filtered by country/city)
      const response = await industriesService.getIndustriesWithLeads(country, city)

      // Group industries by category
      const categoryMap = new Map<string, {
        id: string
        name: string
        icon: string
        description: string
        industries: (IndustryWithCount & { osm_primary_tag: string, osm_additional_tags: string[], active: boolean, sort_order: number })[]
      }>()

      response.industries.forEach((industry) => {
        if (!categoryMap.has(industry.category)) {
          categoryMap.set(industry.category, {
            id: industry.category,
            name: industry.category.charAt(0).toUpperCase() + industry.category.slice(1),
            icon: '📂',
            description: `${industry.category} industries`,
            industries: []
          })
        }

        categoryMap.get(industry.category)!.industries.push({
          ...industry,
          osm_primary_tag: '',
          osm_additional_tags: [],
          active: true,
          sort_order: 0
        })
      })

      const groupedCategories = Array.from(categoryMap.values())
      setCategories(groupedCategories)

      // Expand first category by default
      if (groupedCategories.length > 0) {
        setExpandedCategories(new Set([groupedCategories[0].id]))
      }
    } catch (error: any) {
      console.error('Failed to load industries:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load industries. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleIndustryToggle = (industryId: string) => {
    if (multiSelect) {
      // Multi-select mode: toggle industry in array
      const newSelection = selectedIndustries.includes(industryId)
        ? selectedIndustries.filter((id) => id !== industryId)
        : [...selectedIndustries, industryId]
      onChange(newSelection)
    } else {
      // Single-select mode: replace selection
      onChange([industryId])
    }
  }

  const selectAll = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    if (!category) return

    const categoryIndustryIds = category.industries.map((ind) => ind.id)

    if (multiSelect) {
      // Add all industries from this category
      const newSelection = Array.from(
        new Set([...selectedIndustries, ...categoryIndustryIds])
      )
      onChange(newSelection)
    } else {
      // Select first industry in category
      onChange([categoryIndustryIds[0]])
    }
  }

  const clearAll = () => {
    onChange([])
  }

  const findIndustryById = (industryId: string) => {
    for (const category of categories) {
      const industry = category.industries.find((ind) => ind.id === industryId)
      if (industry) return industry
    }
    return null
  }

  // Get popular industries that exist in our data
  const popularIndustries = POPULAR_INDUSTRIES.map(findIndustryById).filter(Boolean) as (IndustryWithCount & { osm_primary_tag: string, osm_additional_tags: string[], active: boolean, sort_order: number })[]

  // Filter categories and industries based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories

    const query = searchQuery.toLowerCase()
    return categories
      .map(category => ({
        ...category,
        industries: category.industries.filter(ind =>
          ind.name.toLowerCase().includes(query) ||
          ind.description?.toLowerCase().includes(query) ||
          ind.id.toLowerCase().includes(query)
        )
      }))
      .filter(cat => cat.industries.length > 0)
  }, [categories, searchQuery])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading industries...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center text-destructive">
              <AlertCircle className="h-6 w-6 mr-2" />
              <p className="font-semibold">Failed to load industries</p>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={loadIndustries} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No industries available</p>
            <p className="text-sm text-muted-foreground">Please contact support if this issue persists</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Industry</CardTitle>
            <CardDescription>
              {multiSelect ? 'Select one or more industries' : 'Select an industry'}
            </CardDescription>
          </div>
          {selectedIndustries.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear Selection
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-white pb-4 border-b mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search industries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {selectedIndustries.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Selected:</span>
            {categories.flatMap((cat) => cat.industries).map((industry) => {
              if (!selectedIndustries.includes(industry.id)) return null
              return (
                <Badge key={industry.id} variant="secondary">
                  {industry.icon} {industry.name}
                </Badge>
              )
            })}
          </div>
        )}

        {/* Scrollable Content Wrapper */}
        <div className="max-h-[50vh] sm:max-h-[300px] overflow-y-auto">
          <div className="space-y-2">
            {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id)
            const categoryIndustryIds = category.industries.map((ind) => ind.id)
            const selectedCount = selectedIndustries.filter((id) =>
              categoryIndustryIds.includes(id)
            ).length

            return (
              <div key={category.id} className="border rounded-lg">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`category-content-${category.id}`}
                  aria-label={`${category.name} category with ${category.industries.length} industries`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold text-sm">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.industries.length} industries
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                      <Badge variant="default" className="text-xs">
                        {selectedCount} selected
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Category Content */}
                {isExpanded && (
                  <div
                    id={`category-content-${category.id}`}
                    className="border-t p-3 bg-gray-50"
                    role="region"
                    aria-label={`${category.name} industries`}
                  >
                    {multiSelect && (
                      <div className="mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => selectAll(category.id)}
                          className="h-auto py-1 px-2 text-xs"
                        >
                          Select All
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      {category.industries.map((industry: any) => {
                        const isSelected = selectedIndustries.includes(industry.id)
                        const leadCount = industry.lead_count || 0
                        const countries = industry.countries || []

                        return (
                          <div
                            key={industry.id}
                            className="flex items-start gap-2 p-2 rounded hover:bg-white transition-colors"
                          >
                            <input
                              type={multiSelect ? 'checkbox' : 'radio'}
                              id={`industry-${industry.id}`}
                              checked={isSelected}
                              onChange={() => handleIndustryToggle(industry.id)}
                              className="mt-1 h-4 w-4 cursor-pointer"
                            />
                            <Label
                              htmlFor={`industry-${industry.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span>{industry.icon}</span>
                                  <div>
                                    <div className="font-medium text-sm">{industry.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {industry.description}
                                    </div>
                                    {countries.length > 0 && (
                                      <div className="text-xs text-muted-foreground mt-0.5">
                                        📍 {countries.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {leadCount} leads
                                </Badge>
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
