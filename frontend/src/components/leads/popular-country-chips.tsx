'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface PopularCountryChipsProps {
  selectedCountry?: string
  onSelectCountry: (country: string) => void
  popularCountries: string[]
  getCountryFlag: (code: string) => string
  getCountryName: (code: string) => string
}

export function PopularCountryChips({
  selectedCountry,
  onSelectCountry,
  popularCountries,
  getCountryFlag,
  getCountryName,
}: PopularCountryChipsProps) {
  const [showAll, setShowAll] = useState(false)
  const displayCountries = showAll ? popularCountries : popularCountries.slice(0, 8)

  if (!popularCountries || popularCountries.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {displayCountries.map((code) => (
          <Badge
            key={code}
            variant={selectedCountry === code ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1.5"
            onClick={() => onSelectCountry(code)}
          >
            <span className="mr-1.5">{getCountryFlag(code)}</span>
            <span className="text-xs font-medium">{getCountryName(code)}</span>
          </Badge>
        ))}
      </div>

      {popularCountries.length > 8 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : `+${popularCountries.length - 8} More Countries`}
          <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
        </Button>
      )}
    </div>
  )
}
