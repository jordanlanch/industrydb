/**
 * Advanced Filter Panel Component
 * Comprehensive filtering interface for lead search
 */
'use client'

import { useState } from 'react'
import { IndustrySelectorV2, type IndustrySelection } from './industry-selector-v2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Search, X, Save } from 'lucide-react'

// Filter state interface
export interface FilterState {
  // Industry & Sub-niche
  selections: IndustrySelection[]

  // Location
  country?: string
  city?: string
  radius?: number // in miles

  // Data Quality
  hasEmail?: boolean
  hasPhone?: boolean
  hasWebsite?: boolean
  verified?: boolean
  qualityScoreMin?: number
  qualityScoreMax?: number

  // Specialty Tags (industry-specific)
  specialties?: string[]
}

interface AdvancedFilterPanelProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onSearch: () => void
  onClear: () => void
  onSave?: () => void
  multiSelect?: boolean
  maxSelections?: number
  showSaveButton?: boolean
}

// Country list
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
]

// Common specialty tags by industry
const SPECIALTY_TAGS: Record<string, string[]> = {
  restaurant: [
    'Outdoor Seating',
    'Delivery',
    'Takeout',
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Fine Dining',
    'Casual Dining',
    'Family Friendly',
    'Pet Friendly',
    'WiFi',
    'Parking',
  ],
  gym: [
    'Personal Training',
    '24 Hours',
    'Group Classes',
    'Showers',
    'Sauna',
    'Pool',
    'Free Trial',
    'Student Discount',
  ],
  tattoo: [
    'Walk-ins Welcome',
    'Appointments Only',
    'Custom Designs',
    'Cover-ups',
    'Touch-ups',
    'Piercing',
  ],
  beauty: [
    'Walk-ins Welcome',
    'Appointments Required',
    'Bridal Services',
    'Men\'s Services',
    'Women\'s Services',
    'Organic Products',
  ],
}

export function AdvancedFilterPanel({
  filters,
  onChange,
  onSearch,
  onClear,
  onSave,
  multiSelect = true,
  maxSelections,
  showSaveButton = false,
}: AdvancedFilterPanelProps) {
  // Collapsible section states
  const [industryOpen, setIndustryOpen] = useState(true)
  const [locationOpen, setLocationOpen] = useState(true)
  const [qualityOpen, setQualityOpen] = useState(true)
  const [specialtyOpen, setSpecialtyOpen] = useState(true)

  // Get relevant specialty tags based on selected industry
  const getRelevantSpecialties = (): string[] => {
    if (!filters.selections.length) return []
    const industryId = filters.selections[0].industryId
    return SPECIALTY_TAGS[industryId] || []
  }

  const relevantSpecialties = getRelevantSpecialties()

  // Handler to update filters
  const updateFilters = (updates: Partial<FilterState>) => {
    onChange({ ...filters, ...updates })
  }

  // Toggle specialty tag
  const toggleSpecialty = (tag: string) => {
    const current = filters.specialties || []
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag]
    updateFilters({ specialties: updated })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Industry & Sub-niche Section */}
        <Collapsible open={industryOpen} onOpenChange={setIndustryOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold">Industry & Sub-niche</h3>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                industryOpen ? 'transform rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <IndustrySelectorV2
              selections={filters.selections}
              onChange={(selections) => updateFilters({ selections })}
              multiSelect={multiSelect}
              maxSelections={maxSelections}
              showCounts={true}
              compact={true}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Location Section */}
        <Collapsible open={locationOpen} onOpenChange={setLocationOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold">Location</h3>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                locationOpen ? 'transform rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            {/* Country */}
            <div>
              <Label htmlFor="country" className="text-sm">Country</Label>
              <Select
                value={filters.country || ''}
                onValueChange={(value) => updateFilters({ country: value })}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city" className="text-sm">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="e.g. New York"
                value={filters.city || ''}
                onChange={(e) => updateFilters({ city: e.target.value })}
              />
            </div>

            {/* Radius */}
            <div>
              <Label htmlFor="radius" className="text-sm">
                Radius: {filters.radius || 25} miles
              </Label>
              <Slider
                id="radius"
                min={5}
                max={100}
                step={5}
                value={[filters.radius || 25]}
                onValueChange={(value) => updateFilters({ radius: value[0] })}
                className="mt-2"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Data Quality Section */}
        <Collapsible open={qualityOpen} onOpenChange={setQualityOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold">Data Quality</h3>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                qualityOpen ? 'transform rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            {/* Required Fields */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Required Fields</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-email"
                    checked={filters.hasEmail || false}
                    onCheckedChange={(checked) =>
                      updateFilters({ hasEmail: !!checked })
                    }
                  />
                  <label
                    htmlFor="has-email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Has Email
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-phone"
                    checked={filters.hasPhone || false}
                    onCheckedChange={(checked) =>
                      updateFilters({ hasPhone: !!checked })
                    }
                  />
                  <label
                    htmlFor="has-phone"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Has Phone
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-website"
                    checked={filters.hasWebsite || false}
                    onCheckedChange={(checked) =>
                      updateFilters({ hasWebsite: !!checked })
                    }
                  />
                  <label
                    htmlFor="has-website"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Has Website
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.verified || false}
                    onCheckedChange={(checked) =>
                      updateFilters({ verified: !!checked })
                    }
                  />
                  <label
                    htmlFor="verified"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Verified Only
                  </label>
                </div>
              </div>
            </div>

            {/* Quality Score Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Quality Score Range: {filters.qualityScoreMin || 0} - {filters.qualityScoreMax || 100}
              </Label>

              <div>
                <Label htmlFor="quality-score-min" className="text-xs text-muted-foreground">
                  Minimum: {filters.qualityScoreMin || 0}
                </Label>
                <Slider
                  id="quality-score-min"
                  min={0}
                  max={filters.qualityScoreMax || 100}
                  step={5}
                  value={[filters.qualityScoreMin || 0]}
                  onValueChange={(value) =>
                    updateFilters({ qualityScoreMin: value[0] })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="quality-score-max" className="text-xs text-muted-foreground">
                  Maximum: {filters.qualityScoreMax || 100}
                </Label>
                <Slider
                  id="quality-score-max"
                  min={filters.qualityScoreMin || 0}
                  max={100}
                  step={5}
                  value={[filters.qualityScoreMax || 100]}
                  onValueChange={(value) =>
                    updateFilters({ qualityScoreMax: value[0] })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Specialty Tags Section */}
        {relevantSpecialties.length > 0 && (
          <Collapsible open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold">
                Specialties
                {filters.specialties && filters.specialties.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({filters.specialties.length} selected)
                  </span>
                )}
              </h3>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  specialtyOpen ? 'transform rotate-180' : ''
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {relevantSpecialties.map((tag) => {
                  const isSelected = (filters.specialties || []).includes(tag)
                  return (
                    <Badge
                      key={tag}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/90"
                      onClick={() => toggleSpecialty(tag)}
                    >
                      {tag}
                      {isSelected && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  )
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            onClick={onSearch}
            className="flex-1 sm:flex-none"
            size="lg"
          >
            <Search className="mr-2 h-4 w-4" />
            Search Leads
          </Button>

          <Button
            onClick={onClear}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>

          {showSaveButton && onSave && (
            <Button
              onClick={onSave}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Search
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
