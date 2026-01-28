/**
 * Enhanced Industry Selector V2
 * 3-Panel Layout: Categories → Industries → Sub-Niches
 * Features: Multi-select, Search, Lead counts, Tier-based limits
 */
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, X, Loader2, ChevronRight } from 'lucide-react'
import { IndustryIcon, CategoryBadge } from '@/components/industry-icon'
import { industriesService } from '@/services/industries.service'
import type { IndustryCategory, SubNiche } from '@/types'
import { cn } from '@/lib/utils'

export interface IndustrySelection {
  industryId: string
  industryName: string
  subNicheId?: string
  subNicheName?: string
}

interface IndustrySelectorV2Props {
  /** Current selections */
  selections: IndustrySelection[]
  /** Callback when selections change */
  onChange: (selections: IndustrySelection[]) => void
  /** Enable multi-select */
  multiSelect?: boolean
  /** Maximum number of selections (for tier limits) */
  maxSelections?: number
  /** Show lead counts */
  showCounts?: boolean
  /** Compact mode (smaller) */
  compact?: boolean
}

export function IndustrySelectorV2({
  selections = [],
  onChange,
  multiSelect = false,
  maxSelections,
  showCounts = true,
  compact = false,
}: IndustrySelectorV2Props) {
  // State
  const [categories, setCategories] = useState<IndustryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [subNiches, setSubNiches] = useState<SubNiche[]>([])
  const [loadingSubNiches, setLoadingSubNiches] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Load categories and industries
  useEffect(() => {
    loadIndustries()
  }, [])

  // Load sub-niches when industry is selected
  useEffect(() => {
    if (selectedIndustry) {
      loadSubNiches(selectedIndustry)
    } else {
      setSubNiches([])
    }
  }, [selectedIndustry])

  const loadIndustries = async () => {
    try {
      const response = await industriesService.getAllIndustries()
      setCategories(response.categories)
      // Auto-select first category
      if (response.categories.length > 0) {
        setSelectedCategory(response.categories[0].id)
      }
    } catch (error) {
      console.error('Failed to load industries:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubNiches = async (industryId: string) => {
    setLoadingSubNiches(true)
    try {
      const response = await industriesService.getSubNiches(industryId)
      if (response.has_sub_niches) {
        setSubNiches(response.sub_niches)
      } else {
        setSubNiches([])
      }
    } catch (error) {
      console.error('Failed to load sub-niches:', error)
      setSubNiches([])
    } finally {
      setLoadingSubNiches(false)
    }
  }

  // Filter industries by search query
  const filteredIndustries = useMemo(() => {
    if (!selectedCategory) return []

    const category = categories.find((cat) => cat.id === selectedCategory)
    if (!category) return []

    if (!searchQuery.trim()) {
      return category.industries
    }

    const query = searchQuery.toLowerCase()
    return category.industries.filter(
      (industry) =>
        industry.name.toLowerCase().includes(query) ||
        industry.description.toLowerCase().includes(query)
    )
  }, [categories, selectedCategory, searchQuery])

  // Filter sub-niches by search query
  const filteredSubNiches = useMemo(() => {
    if (!searchQuery.trim()) return subNiches

    const query = searchQuery.toLowerCase()
    return subNiches.filter(
      (subNiche) =>
        subNiche.name.toLowerCase().includes(query) ||
        subNiche.description.toLowerCase().includes(query)
    )
  }, [subNiches, searchQuery])

  // Check if selection exists
  const isSelected = (industryId: string, subNicheId?: string) => {
    return selections.some(
      (sel) => sel.industryId === industryId && sel.subNicheId === subNicheId
    )
  }

  // Check if at max selections
  const isAtMaxSelections = maxSelections && selections.length >= maxSelections

  // Handle selection toggle
  const handleToggle = (
    industryId: string,
    industryName: string,
    subNicheId?: string,
    subNicheName?: string
  ) => {
    const selectionKey = subNicheId
      ? `${industryId}:${subNicheId}`
      : industryId

    const existingIndex = selections.findIndex(
      (sel) =>
        sel.industryId === industryId && sel.subNicheId === subNicheId
    )

    if (existingIndex >= 0) {
      // Remove selection
      const newSelections = selections.filter((_, i) => i !== existingIndex)
      onChange(newSelections)
    } else {
      // Add selection
      if (!multiSelect) {
        // Single select: replace
        onChange([{ industryId, industryName, subNicheId, subNicheName }])
      } else if (!isAtMaxSelections) {
        // Multi select: add
        onChange([
          ...selections,
          { industryId, industryName, subNicheId, subNicheName },
        ])
      }
    }
  }

  // Remove specific selection
  const removeSelection = (index: number) => {
    const newSelections = selections.filter((_, i) => i !== index)
    onChange(newSelections)
  }

  // Clear all selections
  const clearAll = () => {
    onChange([])
  }

  if (loading) {
    return (
      <Card className={compact ? 'shadow-sm' : ''}>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading industries...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={compact ? 'shadow-sm' : ''}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={compact ? 'text-lg' : ''}>
              Industry & Sub-Niche
            </CardTitle>
            <CardDescription className={compact ? 'text-xs' : ''}>
              {multiSelect
                ? `Select up to ${maxSelections || '∞'} industries`
                : 'Select an industry and sub-niche'}
            </CardDescription>
          </div>
          {selections.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </div>

        {/* Selected items */}
        {selections.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selections.map((sel, index) => (
              <Badge
                key={`${sel.industryId}-${sel.subNicheId || 'none'}`}
                variant="secondary"
                className="pl-2 pr-1 py-1"
              >
                <IndustryIcon industryId={sel.industryId} size="xs" className="mr-1" />
                <span className="text-xs">
                  {sel.subNicheName
                    ? `${sel.industryName} · ${sel.subNicheName}`
                    : sel.industryName}
                </span>
                <button
                  onClick={() => removeSelection(index)}
                  className="ml-1 hover:bg-gray-200 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search industries and sub-niches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : ''}>
        {/* Mobile: Tabs */}
        <div className="block lg:hidden">
          <Tabs value={selectedIndustry || selectedCategory || 'categories'}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger
                value={selectedIndustry || 'industries'}
                disabled={!selectedCategory}
              >
                Industries
              </TabsTrigger>
              <TabsTrigger
                value={selectedIndustry || 'sub-niches'}
                disabled={!selectedIndustry}
              >
                Sub-Niches
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="mt-3">
              <CategoryPanel
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                compact={compact}
              />
            </TabsContent>

            <TabsContent value={selectedIndustry || 'industries'} className="mt-3">
              <IndustryPanel
                industries={filteredIndustries}
                selectedIndustry={selectedIndustry}
                onSelectIndustry={setSelectedIndustry}
                onToggle={(industryId, industryName) =>
                  handleToggle(industryId, industryName)
                }
                isSelected={(id) => isSelected(id)}
                multiSelect={multiSelect}
                isAtMax={isAtMaxSelections}
                compact={compact}
              />
            </TabsContent>

            <TabsContent value={selectedIndustry || 'sub-niches'} className="mt-3">
              <SubNichePanel
                subNiches={filteredSubNiches}
                loading={loadingSubNiches}
                selectedIndustry={selectedIndustry}
                onToggle={(subNicheId, subNicheName) => {
                  if (selectedIndustry) {
                    const industry = filteredIndustries.find(
                      (ind) => ind.id === selectedIndustry
                    )
                    if (industry) {
                      handleToggle(
                        selectedIndustry,
                        industry.name,
                        subNicheId,
                        subNicheName
                      )
                    }
                  }
                }}
                isSelected={(subNicheId) =>
                  isSelected(selectedIndustry || '', subNicheId)
                }
                multiSelect={multiSelect}
                isAtMax={isAtMaxSelections}
                showCounts={showCounts}
                compact={compact}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: 3-Panel Side-by-Side */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
          <CategoryPanel
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            compact={compact}
          />

          <IndustryPanel
            industries={filteredIndustries}
            selectedIndustry={selectedIndustry}
            onSelectIndustry={setSelectedIndustry}
            onToggle={(industryId, industryName) =>
              handleToggle(industryId, industryName)
            }
            isSelected={(id) => isSelected(id)}
            multiSelect={multiSelect}
            isAtMax={isAtMaxSelections}
            compact={compact}
          />

          <SubNichePanel
            subNiches={filteredSubNiches}
            loading={loadingSubNiches}
            selectedIndustry={selectedIndustry}
            onToggle={(subNicheId, subNicheName) => {
              if (selectedIndustry) {
                const industry = filteredIndustries.find(
                  (ind) => ind.id === selectedIndustry
                )
                if (industry) {
                  handleToggle(
                    selectedIndustry,
                    industry.name,
                    subNicheId,
                    subNicheName
                  )
                }
              }
            }}
            isSelected={(subNicheId) =>
              isSelected(selectedIndustry || '', subNicheId)
            }
            multiSelect={multiSelect}
            isAtMax={isAtMaxSelections}
            showCounts={showCounts}
            compact={compact}
          />
        </div>

        {/* Tier limit warning */}
        {isAtMaxSelections && multiSelect && (
          <div className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
            ⚠️ You've reached the maximum of {maxSelections} selections.{' '}
            <button className="underline font-medium">Upgrade</button> for unlimited
            selections.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Category Panel Component
function CategoryPanel({
  categories,
  selectedCategory,
  onSelectCategory,
  compact,
}: {
  categories: IndustryCategory[]
  selectedCategory: string | null
  onSelectCategory: (id: string) => void
  compact?: boolean
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={cn(
        'bg-gray-50 border-b px-3 font-medium text-gray-700',
        compact ? 'py-2 text-xs' : 'py-2.5 text-sm'
      )}>
        Categories
      </div>
      <div className={cn('overflow-y-auto', compact ? 'max-h-64' : 'max-h-96')}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'w-full text-left px-3 py-2 border-b last:border-b-0 transition-colors',
              selectedCategory === category.id
                ? 'bg-blue-50 border-l-2 border-l-blue-500'
                : 'hover:bg-gray-50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndustryIcon categoryId={category.id} size="sm" />
                <div>
                  <div className={cn(
                    'font-medium',
                    compact ? 'text-xs' : 'text-sm'
                  )}>
                    {category.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {category.industries.length} industries
                  </div>
                </div>
              </div>
              {selectedCategory === category.id && (
                <ChevronRight className="h-4 w-4 text-blue-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Industry Panel Component
function IndustryPanel({
  industries,
  selectedIndustry,
  onSelectIndustry,
  onToggle,
  isSelected,
  multiSelect,
  isAtMax,
  compact,
}: {
  industries: any[]
  selectedIndustry: string | null
  onSelectIndustry: (id: string) => void
  onToggle: (id: string, name: string) => void
  isSelected: (id: string) => boolean
  multiSelect: boolean
  isAtMax?: boolean
  compact?: boolean
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={cn(
        'bg-gray-50 border-b px-3 font-medium text-gray-700',
        compact ? 'py-2 text-xs' : 'py-2.5 text-sm'
      )}>
        Industries
        {industries.length > 0 && (
          <span className="ml-1 text-muted-foreground">
            ({industries.length})
          </span>
        )}
      </div>
      <div className={cn('overflow-y-auto', compact ? 'max-h-64' : 'max-h-96')}>
        {industries.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Select a category to view industries
          </div>
        ) : (
          industries.map((industry) => {
            const selected = isSelected(industry.id)
            const disabled = isAtMax && !selected

            return (
              <div
                key={industry.id}
                className={cn(
                  'flex items-start gap-2 px-3 py-2 border-b last:border-b-0 transition-colors',
                  selectedIndustry === industry.id
                    ? 'bg-blue-50 border-l-2 border-l-blue-500'
                    : 'hover:bg-gray-50',
                  disabled && 'opacity-50'
                )}
              >
                {multiSelect && (
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(industry.id, industry.name)}
                    disabled={disabled}
                    className="mt-1 h-4 w-4 cursor-pointer"
                  />
                )}
                <button
                  onClick={() => {
                    onSelectIndustry(industry.id)
                    if (!multiSelect) {
                      onToggle(industry.id, industry.name)
                    }
                  }}
                  className="flex-1 text-left"
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2">
                    <IndustryIcon industryId={industry.id} size="sm" />
                    <div className="flex-1">
                      <div className={cn(
                        'font-medium',
                        compact ? 'text-xs' : 'text-sm'
                      )}>
                        {industry.name}
                      </div>
                      {!compact && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {industry.description}
                        </div>
                      )}
                    </div>
                    {selectedIndustry === industry.id && (
                      <ChevronRight className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Sub-Niche Panel Component
function SubNichePanel({
  subNiches,
  loading,
  selectedIndustry,
  onToggle,
  isSelected,
  multiSelect,
  isAtMax,
  showCounts,
  compact,
}: {
  subNiches: SubNiche[]
  loading: boolean
  selectedIndustry: string | null
  onToggle: (id: string, name: string) => void
  isSelected: (id: string) => boolean
  multiSelect: boolean
  isAtMax?: boolean
  showCounts?: boolean
  compact?: boolean
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={cn(
        'bg-gray-50 border-b px-3 font-medium text-gray-700',
        compact ? 'py-2 text-xs' : 'py-2.5 text-sm'
      )}>
        Sub-Niches
        {subNiches.length > 0 && (
          <span className="ml-1 text-muted-foreground">
            ({subNiches.length})
          </span>
        )}
      </div>
      <div className={cn('overflow-y-auto', compact ? 'max-h-64' : 'max-h-96')}>
        {loading ? (
          <div className="px-3 py-8 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : !selectedIndustry ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            Select an industry to view sub-niches
          </div>
        ) : subNiches.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            No sub-niches available for this industry
          </div>
        ) : (
          subNiches.map((subNiche) => {
            const selected = isSelected(subNiche.id)
            const disabled = isAtMax && !selected

            return (
              <div
                key={subNiche.id}
                className={cn(
                  'flex items-start gap-2 px-3 py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors',
                  disabled && 'opacity-50'
                )}
              >
                <input
                  type={multiSelect ? 'checkbox' : 'radio'}
                  checked={selected}
                  onChange={() => onToggle(subNiche.id, subNiche.name)}
                  disabled={disabled}
                  className="mt-1 h-4 w-4 cursor-pointer"
                />
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className={cn(
                        'font-medium flex items-center gap-1.5',
                        compact ? 'text-xs' : 'text-sm'
                      )}>
                        <span>{subNiche.icon}</span>
                        <span>{subNiche.name}</span>
                        {subNiche.popular && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            Popular
                          </Badge>
                        )}
                      </div>
                      {!compact && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {subNiche.description}
                        </div>
                      )}
                    </div>
                    {showCounts && subNiche.count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {subNiche.count}
                      </Badge>
                    )}
                  </div>
                </label>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
