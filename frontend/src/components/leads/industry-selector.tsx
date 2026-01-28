'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { IndustryCategory } from '@/types'
import { industriesService } from '@/services/industries.service'
import { ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react'

interface IndustrySelectorProps {
  selectedIndustries: string[]
  onChange: (industries: string[]) => void
  multiSelect?: boolean
}

export function IndustrySelector({
  selectedIndustries,
  onChange,
  multiSelect = false,
}: IndustrySelectorProps) {
  const [categories, setCategories] = useState<IndustryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadIndustries()
  }, [])

  const loadIndustries = async () => {
    try {
      setError(null)
      const response = await industriesService.getAllIndustries()
      setCategories(response.categories)
      // Expand first category by default
      if (response.categories.length > 0) {
        setExpandedCategories(new Set([response.categories[0].id]))
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
    <Card>
      <CardHeader>
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
      <CardContent>
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

        <div className="space-y-2">
          {categories.map((category) => {
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
                      {category.industries.map((industry) => {
                        const isSelected = selectedIndustries.includes(industry.id)

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
                              <div className="flex items-center gap-2">
                                <span>{industry.icon}</span>
                                <div>
                                  <div className="font-medium text-sm">{industry.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {industry.description}
                                  </div>
                                </div>
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
      </CardContent>
    </Card>
  )
}
