'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Check, ChevronDown, X, MapPin, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CitySelectorProps {
  value?: string
  onChange: (city: string | undefined) => void
  cities: string[]
  placeholder?: string
  disabled?: boolean
  loading?: boolean
}

/**
 * City selector with autocomplete and fast search
 * Optimized for large city lists with grouped display
 */
export function CitySelector({
  value,
  onChange,
  cities,
  placeholder = 'Select a city',
  disabled = false,
  loading = false,
}: CitySelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery) return cities

    const query = searchQuery.toLowerCase().trim()
    return cities.filter((city) =>
      city.toLowerCase().includes(query)
    )
  }, [cities, searchQuery])

  // Group cities by first letter for better organization
  const groupedCities = useMemo(() => {
    const groups: Record<string, string[]> = {}

    filteredCities.forEach((city) => {
      const firstLetter = city[0]?.toUpperCase() || '#'
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(city)
    })

    // Sort groups alphabetically
    return Object.keys(groups)
      .sort()
      .map((letter) => ({
        letter,
        cities: groups[letter].sort(),
      }))
  }, [filteredCities])

  const handleSelect = (city: string) => {
    onChange(city || undefined)
    setOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
    setSearchQuery('')
  }

  // Reset search when opening/closing
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || loading}
        >
          {loading ? (
            <span className="text-muted-foreground">Loading cities...</span>
          ) : value ? (
            <span className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{value}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value && !disabled && !loading && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={handleClear}
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
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              autoFocus
            />
          </div>
        </div>

        {/* Cities List - Using plain div for better scroll behavior */}
        <div className="max-h-80 overflow-y-auto scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
          {filteredCities.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No cities found
            </div>
          ) : (
            <div className="p-2">
              {/* All Cities Option */}
              {!searchQuery && (
                <button
                  onClick={() => handleSelect('')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors",
                    !value && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>All Cities</span>
                  </div>
                  {!value && <Check className="h-4 w-4" />}
                </button>
              )}

              {/* Grouped Cities */}
              {groupedCities.map((group) => (
                <div key={group.letter} className="mt-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    {group.letter}
                  </div>
                  {group.cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleSelect(city)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors",
                        value === city && "bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{city}</span>
                      </div>
                      {value === city && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        {searchQuery && (
          <div className="border-t p-2 text-xs text-muted-foreground text-center">
            {filteredCities.length} {filteredCities.length === 1 ? 'city' : 'cities'} found
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
