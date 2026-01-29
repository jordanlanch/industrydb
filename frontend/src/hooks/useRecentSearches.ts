'use client'

import { useState, useEffect } from 'react'
import type { LeadSearchRequest } from '@/types'

export interface SavedSearch {
  id: string
  filters: LeadSearchRequest
  timestamp: string
  resultCount: number
}

const STORAGE_KEY = 'industrydb_recent_searches'
const MAX_SEARCHES = 5

/**
 * Hook for managing recent search history
 * Stores searches in localStorage for quick access
 */
export function useRecentSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSearches(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
      setSearches([])
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const addSearch = (filters: LeadSearchRequest, resultCount: number) => {
    try {
      // Create new search entry
      const newSearch: SavedSearch = {
        id: crypto.randomUUID(),
        filters,
        timestamp: new Date().toISOString(),
        resultCount,
      }

      // Add to beginning, keep only MAX_SEARCHES
      const updated = [newSearch, ...searches].slice(0, MAX_SEARCHES)

      setSearches(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save recent search:', error)
    }
  }

  const removeSearch = (id: string) => {
    try {
      const updated = searches.filter((s) => s.id !== id)
      setSearches(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to remove recent search:', error)
    }
  }

  const clearAll = () => {
    try {
      setSearches([])
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear recent searches:', error)
    }
  }

  return {
    searches,
    addSearch,
    removeSearch,
    clearAll,
    isLoaded,
  }
}
