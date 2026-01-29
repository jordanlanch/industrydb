'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { leadsService } from '@/services/leads.service'
import { exportsService } from '@/services/exports.service'
import { filtersService } from '@/services/filters.service'
import { getCountryName, getCountryFlag } from '@/lib/countries'
import type { Lead, LeadSearchRequest, UsageInfo, LeadPreviewResponse } from '@/types'
import { Search, Download, FileSpreadsheet, X, Filter, ChevronLeft, ChevronRight, LayoutGrid, List, Building2, MapPin, Mail, Phone, Shield, Loader2, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/toast-provider'
import { LeadCard } from '@/components/leads/lead-card'
import { LeadTableRow } from '@/components/leads/lead-table-row'
import { LeadCardSkeletonList } from '@/components/leads/lead-card-skeleton'
import { IndustrySelector } from '@/components/leads/industry-selector'
import { SearchButton } from '@/components/leads/search-button'
import { SearchPreview } from '@/components/leads/search-preview'
import { EmptySearchState } from '@/components/leads/empty-search-state'
import { CreditConfirmationDialog } from '@/components/leads/credit-confirmation-dialog'
import { useVirtualization } from '@/hooks/useVirtualization'

export default function LeadsPage() {
  const t = useTranslations('leads')
  const tCommon = useTranslations('common')
  const { toast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [searchTriggered, setSearchTriggered] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // AbortController for canceling previous requests
  const abortControllerRef = useRef<AbortController | null>(null)

  // Virtual scrolling for better performance with large lists
  const { containerRef, visibleItems, totalHeight, offsetY } = useVirtualization({
    items: leads,
    itemHeight: viewMode === 'card' ? 200 : 60, // Adjust based on view mode
    bufferSize: 3
  })
  const [filters, setFilters] = useState<LeadSearchRequest>({
    page: 1,
    limit: 20,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  })
  const [availableCountries, setAvailableCountries] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [loadingCities, setLoadingCities] = useState(false)

  // Preview state
  const [preview, setPreview] = useState<LeadPreviewResponse | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.industry) count++
    if (filters.country) count++
    if (filters.city) count++
    if (filters.has_email) count++
    if (filters.has_phone) count++
    if (filters.verified) count++
    return count
  }, [filters])

  // Calculate statistics from leads
  const stats = useMemo(() => {
    if (leads.length === 0) return { withEmail: 0, withPhone: 0, verified: 0 }
    return {
      withEmail: leads.filter(l => l.email).length,
      withPhone: leads.filter(l => l.phone).length,
      verified: leads.filter(l => l.verified).length,
    }
  }, [leads])

  // Initial load - only once
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      // Check if user is authenticated
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to access leads.',
          variant: 'destructive',
        })
        setTimeout(() => {
          if (mounted) {
            window.location.href = '/login'
          }
        }, 2000)
        return
      }

      // Load data if authenticated
      if (mounted) {
        await Promise.all([
          loadUsage(),
          loadFilterOptions()
        ])
      }
    }

    initialize()

    // Cleanup
    return () => {
      mounted = false
    }
  }, [])

  // Handle pagination changes - only search if already triggered
  useEffect(() => {
    if (filters.page && filters.page > 1 && searchTriggered) {
      loadLeads()
    }
  }, [filters.page])

  // Reload cities when country filter changes
  useEffect(() => {
    if (filters.country) {
      loadCitiesForCountry(filters.country)
    } else {
      setAvailableCities([])
    }
  }, [filters.country])

  // Fetch preview when filters change (debounced)
  useEffect(() => {
    // Debounce the preview fetch to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchPreview()
    }, 500) // Wait 500ms after last filter change

    return () => clearTimeout(timeoutId)
  }, [filters.industry, filters.country, filters.city, filters.has_email, filters.has_phone, filters.verified])

  const loadFilterOptions = async () => {
    try {
      const countries = await filtersService.getCountries()
      setAvailableCountries(countries || [])
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }
  }

  const loadCitiesForCountry = async (country: string) => {
    setLoadingCities(true)
    try {
      const cities = await filtersService.getCities(country)
      setAvailableCities(cities || [])
    } catch (error) {
      console.error('Failed to load cities:', error)
      setAvailableCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  const handleSearchClick = () => {
    // Reset to page 1 when starting new search
    if (filters.page !== 1) {
      setFilters({ ...filters, page: 1 })
    }

    // If low on credits, show confirmation dialog
    if (usage && usage.remaining <= 10 && usage.remaining > 0) {
      setShowConfirmDialog(true)
      return
    }

    executeSearch()
  }

  const executeSearch = async () => {
    setShowConfirmDialog(false)
    setSearchTriggered(true)
    await loadLeads()
    // Reload usage after search
    await loadUsage()
  }

  const handleQuickSearch = (industry: string, country: string) => {
    setSelectedIndustries([industry])
    setFilters({ ...filters, industry, country, page: 1 })
    // Trigger search after a short delay to let state update
    setTimeout(() => {
      executeSearch()
    }, 100)
  }

  const fetchPreview = async () => {
    // Only fetch preview if at least one filter is selected
    if (!filters.industry && !filters.country && !filters.has_email && !filters.has_phone && !filters.verified) {
      setPreview(null)
      return
    }

    setPreviewLoading(true)
    setPreviewError(null)

    try {
      const previewData = await leadsService.preview(filters)
      setPreview(previewData)
    } catch (error: any) {
      console.error('Failed to fetch preview:', error)
      setPreviewError(error.message || 'Failed to load preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  const loadLeads = async () => {
    // Prevent concurrent calls
    if (loading) return

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      console.log('🚫 Cancelled previous search request')
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    setLoading(true)
    try {
      const response = await leadsService.search(filters)

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('⏭️  Request was aborted, ignoring response')
        return
      }

      setLeads(response.data || [])
      setPagination(response.pagination)
    } catch (error: any) {
      // Ignore abort errors (user cancelled the request)
      if (error.name === 'AbortError' || error.message?.includes('abort')) {
        console.log('🔕 Search request cancelled by user')
        return
      }

      console.error('Failed to load leads:', error)

      // Handle rate limiting
      if (error.response?.status === 429) {
        toast({
          title: 'Too Many Requests',
          description: 'Please wait a moment before searching again.',
          variant: 'destructive',
        })
        return
      }

      // Handle usage limit errors
      if (error.response?.status === 403 && error.response?.data?.message?.includes('limit')) {
        toast({
          title: 'Usage Limit Reached',
          description: 'You have reached your monthly usage limit. Please upgrade your plan to continue.',
          variant: 'destructive',
        })
        // Reload usage info
        await loadUsage()
        return
      }

      // Handle authentication errors
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to search for leads.',
          variant: 'destructive',
        })
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load leads. Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadUsage = async () => {
    try {
      const data = await leadsService.getUsage()
      setUsage(data)
    } catch (error: any) {
      console.error('Failed to load usage:', error)
      // Don't show toast for usage errors - it's not critical
      // Just log silently
    }
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    if (leads.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please search for leads before exporting.',
        variant: 'destructive',
      })
      return
    }

    setExportLoading(true)
    try {
      const exportData = await exportsService.create({
        format,
        filters,
        max_leads: 1000,
      })
      toast({
        title: 'Export Created!',
        description: `Your ${format.toUpperCase()} export is ready. Check the Exports page to download.`,
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleClearAllFilters = () => {
    setSelectedIndustries([])
    setFilters({ page: 1, limit: 20 })
    setSearchTriggered(false)
    setLeads([])
    setPagination({
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    })
  }

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
        variant: 'default',
      })
    })
  }

  const handleIndustryChange = (industries: string[]) => {
    setSelectedIndustries(industries)
    const industry = industries.length > 0 ? industries[0] : undefined
    setFilters({ ...filters, industry, page: 1 })
    // Reset search state when filters change
    setSearchTriggered(false)
  }

  // Format country display value
  const getCountryDisplay = (code: string | undefined) => {
    if (!code) return 'Select a country'
    return `${getCountryFlag(code)} ${getCountryName(code)}`
  }

  // Format city display value
  const getCityDisplay = (city: string | undefined) => {
    if (!city) return filters.country ? 'Select a city' : 'Select country first'
    return `🏙️ ${city}`
  }

  return (
    <>
      {/* Credit Confirmation Dialog */}
      <CreditConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={executeSearch}
        usage={usage}
      />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden p-4 border-b bg-white">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          aria-expanded={showMobileFilters}
          aria-controls="filter-sidebar"
          aria-label={`${showMobileFilters ? t('hideFilters') : t('showFilters')}${activeFiltersCount > 0 ? ` (${t('filtersActive', { count: activeFiltersCount })})` : ''}`}
        >
          <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
          {showMobileFilters ? t('hideFilters') : t('showFilters')}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">{t('filtersActive', { count: activeFiltersCount })}</Badge>
          )}
        </Button>
      </div>

      {/* SIDEBAR - Filters */}
      <aside
        id="filter-sidebar"
        className={`
          w-full lg:w-80 border-r lg:border-r border-b lg:border-b-0 bg-gray-50/50 flex flex-col overflow-hidden
          ${showMobileFilters ? 'block' : 'hidden lg:flex'}
          max-h-[60vh] lg:max-h-full
        `}
        aria-label="Search filters"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b bg-white">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('filters.title')}
            </h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{t('filtersActive', { count: activeFiltersCount })}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{t('filters.refineSearch')}</p>
        </div>

        {/* Filters Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Industry Filter */}
          <div>
            <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('filters.industry')}
            </Label>
            <IndustrySelector
              selectedIndustries={selectedIndustries}
              onChange={handleIndustryChange}
              multiSelect={false}
            />
          </div>

          <Separator />

          {/* Location Filters */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('filters.location')}
            </Label>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('filters.country')}</Label>
              <Select
                value={filters.country || ''}
                onValueChange={(value) => {
                  setFilters({ ...filters, country: value || undefined, city: undefined, page: 1 })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.selectCountry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">🌍 {t('filters.allCountries')}</SelectItem>
                  {availableCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {getCountryFlag(country)} {getCountryName(country)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('filters.city')}</Label>
              <Select
                value={filters.city || ''}
                onValueChange={(value) => {
                  setFilters({ ...filters, city: value || undefined, page: 1 })
                }}
              >
                <SelectTrigger disabled={!filters.country || loadingCities}>
                  <SelectValue placeholder={
                    loadingCities ? t('filters.loadingCities') :
                    filters.country ? t('filters.selectCity') :
                    t('filters.selectCountryFirst')
                  } />
                </SelectTrigger>
                <SelectContent>
                  {loadingCities ? (
                    <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t('filters.loadingCities')}
                    </div>
                  ) : (
                    <>
                      <SelectItem value="">🗺️ {t('filters.allCities')}</SelectItem>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          🏙️ {city}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Data Quality Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t('filters.dataQuality')}
            </Label>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.has_email || false}
                  onChange={(e) => setFilters({ ...filters, has_email: e.target.checked || undefined, page: 1 })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm">{t('filters.hasEmail')}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.has_phone || false}
                  onChange={(e) => setFilters({ ...filters, has_phone: e.target.checked || undefined, page: 1 })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm">{t('filters.hasPhone')}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.verified || false}
                  onChange={(e) => setFilters({ ...filters, verified: e.target.checked || undefined, page: 1 })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <CheckCircle2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm">{t('filters.verifiedOnly')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t bg-white space-y-3">
          {/* Preview Statistics */}
          <SearchPreview
            preview={preview}
            loading={previewLoading}
            error={previewError}
            hasFilters={activeFiltersCount > 0}
          />

          {/* Search Button */}
          <SearchButton
            onClick={handleSearchClick}
            loading={loading}
            disabled={loading}
            usage={usage}
            hasFilters={activeFiltersCount > 0}
          />

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearAllFilters}
              aria-label={`${t('filters.clearAll')} (${activeFiltersCount})`}
              title={`${t('filters.clearAll')} (${activeFiltersCount})`}
            >
              <X className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('filters.clearAll')}
            </Button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT - Results */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {loading ? (
                  t('searching')
                ) : pagination.total > 0 ? (
                  t('found', { count: pagination.total })
                ) : (
                  t('noLeadsFound')
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1" role="group" aria-label={t('viewMode.card')}>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="px-3"
                  aria-label={t('viewMode.card')}
                  aria-pressed={viewMode === 'card'}
                  title={t('viewMode.card')}
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">{t('viewMode.card')}</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="px-3"
                  aria-label={t('viewMode.table')}
                  aria-pressed={viewMode === 'table'}
                  title={t('viewMode.table')}
                >
                  <List className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">{t('viewMode.table')}</span>
                </Button>
              </div>

              {/* Export Buttons */}
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={exportLoading || leads.length === 0 || loading}
                className="gap-2"
                aria-label={exportLoading ? t('export.csv') : leads.length === 0 ? t('export.noResults', { format: 'CSV' }) : t('export.exportLeads', { count: leads.length, format: 'CSV' })}
                title={leads.length === 0 ? t('export.searchFirst') : t('export.exportLeads', { count: leads.length, format: 'CSV' })}
              >
                {exportLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                )}
                {t('export.csv')}
              </Button>
              <Button
                onClick={() => handleExport('excel')}
                disabled={exportLoading || leads.length === 0 || loading}
                className="gap-2"
                aria-label={exportLoading ? t('export.excel') : leads.length === 0 ? t('export.noResults', { format: 'Excel' }) : t('export.exportLeads', { count: leads.length, format: 'Excel' })}
                title={leads.length === 0 ? t('export.searchFirst') : t('export.exportLeads', { count: leads.length, format: 'Excel' })}
              >
                {exportLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {t('export.excel')}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {leads.length > 0 && !loading && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('stats.email')}:</span>
                <span className="font-medium">{stats.withEmail}</span>
                <span className="text-muted-foreground">({Math.round((stats.withEmail / leads.length) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('stats.phone')}:</span>
                <span className="font-medium">{stats.withPhone}</span>
                <span className="text-muted-foreground">({Math.round((stats.withPhone / leads.length) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('stats.verified')}:</span>
                <span className="font-medium">{stats.verified}</span>
                <span className="text-muted-foreground">({Math.round((stats.verified / leads.length) * 100)}%)</span>
              </div>
            </div>
          )}
        </header>

        {/* Results Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <LeadCardSkeletonList count={5} />
          ) : !searchTriggered ? (
            <EmptySearchState usage={usage} onQuickSearch={handleQuickSearch} />
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('emptyState.title')}</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {t('emptyState.description')}
              </p>
              <Button variant="outline" onClick={handleClearAllFilters}>
                <X className="mr-2 h-4 w-4" />
                {t('emptyState.clearButton')}
              </Button>
            </div>
          ) : viewMode === 'card' ? (
            <div
              ref={containerRef}
              className="overflow-y-auto"
              style={{ height: 'calc(100vh - 300px)' }}
            >
              <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                  style={{
                    transform: `translateY(${offsetY}px)`,
                    position: 'absolute',
                    width: '100%'
                  }}
                  className="space-y-4"
                >
                  {visibleItems.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onCopyText={handleCopyText}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <div
                ref={containerRef}
                className="overflow-auto"
                style={{ height: 'calc(100vh - 300px)' }}
              >
                <div style={{ height: totalHeight, position: 'relative' }}>
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr className="border-b bg-gray-50">
                        <th className="p-4 text-left text-sm font-semibold">{t('table.business')}</th>
                        <th className="p-4 text-left text-sm font-semibold">{t('table.industry')}</th>
                        <th className="p-4 text-left text-sm font-semibold">{t('table.email')}</th>
                        <th className="p-4 text-left text-sm font-semibold">{t('table.phone')}</th>
                        <th className="p-4 text-left text-sm font-semibold">{t('table.website')}</th>
                        <th className="p-4 text-center text-sm font-semibold">{t('table.quality')}</th>
                      </tr>
                    </thead>
                    <tbody style={{ transform: `translateY(${offsetY}px)` }}>
                      {visibleItems.map((lead) => (
                        <LeadTableRow
                          key={lead.id}
                          lead={lead}
                          onCopyEmail={(email) => handleCopyText(email, 'Email')}
                          onCopyPhone={(phone) => handleCopyText(phone, 'Phone')}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination navigation">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={!pagination.has_prev || loading}
                aria-label={t('pagination.goToPrevious', { page: (filters.page || 1) - 1 })}
              >
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                {t('pagination.previous')}
              </Button>
              <div className="flex items-center gap-2 px-4" role="status" aria-live="polite">
                <span className="text-sm font-medium">
                  {t('pagination.page', { current: filters.page, total: pagination.total_pages })}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={!pagination.has_next || loading}
                aria-label={t('pagination.goToNext', { page: (filters.page || 1) + 1 })}
              >
                {t('pagination.next')}
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Button>
            </nav>
          )}
        </div>
      </main>
      </div>
    </>
  )
}
