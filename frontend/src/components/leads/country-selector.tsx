'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react'
import { POPULAR_COUNTRIES, COUNTRY_REGIONS } from '@/lib/country-regions'
import { useTranslations } from 'next-intl'

interface CountrySelectorProps {
  value?: string
  onChange: (country: string | undefined) => void
  availableCountries: string[]
  getCountryName?: (code: string) => string
  getCountryFlag?: (code: string) => string
}

/**
 * Enhanced country selector with search, popular countries, and regional grouping
 */
export function CountrySelector({
  value,
  onChange,
  availableCountries,
  getCountryName = (code) => code,
  getCountryFlag = (code) => `${code}`,
}: CountrySelectorProps) {
  const t = useTranslations('leads')
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())

  // Filter available countries to only those in our data
  const availableSet = useMemo(
    () => new Set(availableCountries.map((c) => c.toUpperCase())),
    [availableCountries]
  )

  // Popular countries that exist in our data
  const popularCountries = useMemo(
    () => POPULAR_COUNTRIES.filter((code) => availableSet.has(code)),
    [availableSet]
  )

  // Filter and group countries by region
  const filteredRegions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    return COUNTRY_REGIONS.map((region) => {
      const countries = region.countries
        .filter((code) => {
          // Must be in available countries
          if (!availableSet.has(code)) return false

          // If searching, filter by query
          if (query) {
            const countryName = getCountryName(code).toLowerCase()
            return (
              countryName.includes(query) ||
              code.toLowerCase().includes(query)
            )
          }

          return true
        })
        .sort((a, b) => {
          // Sort by country name
          return getCountryName(a).localeCompare(getCountryName(b))
        })

      return {
        ...region,
        countries,
      }
    }).filter((region) => region.countries.length > 0) // Only show regions with countries
  }, [searchQuery, availableSet, getCountryName])

  const handleSelect = (country: string) => {
    onChange(country === value ? undefined : country)
    setOpen(false)
    setSearchQuery('')
  }

  const handleClear = () => {
    onChange(undefined)
    setOpen(false)
    setSearchQuery('')
  }

  const toggleRegion = (regionId: string) => {
    const newExpanded = new Set(expandedRegions)
    if (newExpanded.has(regionId)) {
      newExpanded.delete(regionId)
    } else {
      newExpanded.add(regionId)
    }
    setExpandedRegions(newExpanded)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <span className="flex items-center gap-2 truncate">
              <span>{getCountryFlag(value)}</span>
              <span className="truncate">{getCountryName(value)}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              {t('filters.selectCountry')}
            </span>
          )}
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
              />
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* Search Input */}
        <div className="p-3 border-b sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('filters.countrySelector.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              autoFocus
            />
          </div>
        </div>

        {/* Popular Countries */}
        {!searchQuery && popularCountries.length > 0 && (
          <div className="p-3 border-b">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t('filters.countrySelector.popular')}
            </Label>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {popularCountries.map((country) => (
                <Button
                  key={country}
                  variant={value === country ? 'default' : 'ghost'}
                  size="sm"
                  className="justify-start h-auto py-2 px-3"
                  onClick={() => handleSelect(country)}
                >
                  <span className="mr-2">{getCountryFlag(country)}</span>
                  <span className="truncate text-xs">
                    {getCountryName(country)}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Regions */}
        <ScrollArea className="max-h-96">
          {filteredRegions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No countries found
            </div>
          ) : (
            <div className="py-2">
              {filteredRegions.map((region) => (
                <Collapsible
                  key={region.id}
                  open={searchQuery ? true : expandedRegions.has(region.id)}
                  onOpenChange={() => toggleRegion(region.id)}
                >
                  <CollapsibleTrigger className="w-full p-3 hover:bg-accent flex items-center justify-between group">
                    <span className="font-medium text-sm flex items-center gap-2">
                      <span>{region.icon}</span>
                      <span>{region.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {region.countries.length}
                      </Badge>
                      {!searchQuery && (
                        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-muted/30">
                    {region.countries.map((country) => (
                      <Button
                        key={country}
                        variant={value === country ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start px-6 h-auto py-2"
                        onClick={() => handleSelect(country)}
                      >
                        <span className="mr-2">{getCountryFlag(country)}</span>
                        <span className="truncate text-xs">
                          {getCountryName(country)}
                        </span>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
