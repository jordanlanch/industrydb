'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
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
  countryStats?: Record<string, number> // Optional lead counts per country
}

/**
 * Highlight text matching the search query
 */
function highlightMatch(text: string, query: string) {
  if (!query) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
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
  countryStats,
}: CountrySelectorProps) {
  const t = useTranslations('leads')
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())
  const [selectedIndex, setSelectedIndex] = useState(0)

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
        id: region.code,
        name: region.name,
        code: region.code,
        icon: '🌍',
        countries,
      }
    }).filter((region) => region.countries.length > 0) // Only show regions with countries
  }, [searchQuery, availableSet, getCountryName])

  // Flat list of all countries for keyboard navigation
  const allCountries = useMemo(() => {
    return filteredRegions.flatMap((r) => r.countries)
  }, [filteredRegions])

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || allCountries.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, allCountries.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (allCountries[selectedIndex]) {
          handleSelect(allCountries[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }

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
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 p-0" align="start">
        {/* Search Input */}
        <div className="p-3 border-b sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('filters.countrySelector.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-8"
              autoFocus
            />
          </div>
        </div>

        {/* Regions with controlled height - Using plain div for better scroll behavior */}
        <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto scroll-smooth"
             style={{ scrollbarWidth: 'thin' }}>
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
                  <CollapsibleTrigger className="w-full px-3 py-2 hover:bg-accent flex items-center justify-between group">
                    <span className="font-medium text-xs flex items-center gap-2">
                      <span className="text-sm">{region.icon}</span>
                      <span>{region.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {region.countries.length}
                      </span>
                      {!searchQuery && (
                        <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-muted/30 py-1">
                    {region.countries.map((country, idx) => {
                      const globalIndex = allCountries.indexOf(country)
                      const isKeyboardSelected = globalIndex === selectedIndex

                      return (
                        <button
                          key={country}
                          onClick={() => handleSelect(country)}
                          className={`w-full flex items-center justify-between px-6 py-1.5 text-sm hover:bg-accent transition-colors ${
                            value === country ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                          } ${isKeyboardSelected ? 'bg-accent' : ''}`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{getCountryFlag(country)}</span>
                            <span className="truncate text-xs">
                              {highlightMatch(getCountryName(country), searchQuery)}
                            </span>
                          </div>
                          {countryStats?.[country] && (
                            <span className="ml-2 text-xs opacity-60 shrink-0">
                              {countryStats[country].toLocaleString()}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>

        {/* Results counter */}
        {searchQuery && allCountries.length > 0 && (
          <div className="border-t p-2 text-xs text-muted-foreground text-center">
            {allCountries.length} {allCountries.length === 1 ? 'country' : 'countries'} found
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
