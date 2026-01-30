'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook for managing sidebar state with localStorage persistence
 * Used for collapsible sidebars in dashboard layout
 */
export function useSidebarState() {
  // Main navigation sidebar state
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mainSidebarOpen')
      return stored !== 'false' // Default to true if not set
    }
    return true
  })

  // Filter sidebar state (for leads page)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('filterSidebarOpen')
      return stored !== 'false' // Default to true if not set
    }
    return true
  })

  // Persist main sidebar state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mainSidebarOpen', isMainSidebarOpen.toString())
    }
  }, [isMainSidebarOpen])

  // Persist filter sidebar state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('filterSidebarOpen', isFilterSidebarOpen.toString())
    }
  }, [isFilterSidebarOpen])

  const toggleMainSidebar = () => setIsMainSidebarOpen(prev => !prev)
  const toggleFilterSidebar = () => setIsFilterSidebarOpen(prev => !prev)

  return {
    isMainSidebarOpen,
    isFilterSidebarOpen,
    toggleMainSidebar,
    toggleFilterSidebar,
  }
}
