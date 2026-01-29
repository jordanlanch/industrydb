/**
 * Saved Searches Page
 * Manage and re-run saved searches
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/toast-provider'
import { savedSearchesService, type SavedSearch } from '@/services/saved-searches.service'
import { Save, Search, Trash2, Clock, Filter } from 'lucide-react'

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SavedSearchesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadSearches()
  }, [])

  const loadSearches = async () => {
    setLoading(true)
    try {
      const response = await savedSearchesService.getAll()
      setSearches(response.searches || [])
    } catch (error) {
      console.error('Failed to load saved searches:', error)
      toast({
        title: 'Load Failed',
        description: 'Failed to load saved searches',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRunSearch = (search: SavedSearch) => {
    // Store filters in session storage to pass to leads page
    sessionStorage.setItem('leadFilters', JSON.stringify(search.filters))

    // Navigate to leads page
    router.push('/dashboard/leads')

    toast({
      title: 'Search Applied',
      description: `Running "${search.name}" search`,
      variant: 'default',
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await savedSearchesService.delete(deleteId)

      toast({
        title: 'Search Deleted',
        description: 'Saved search has been removed',
        variant: 'default',
      })

      // Reload searches
      await loadSearches()
      setDeleteId(null)
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete saved search',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  // Get filter summary for display
  const getFilterSummary = (search: SavedSearch) => {
    const parts: string[] = []
    const { filters } = search

    if (filters.selections && filters.selections.length > 0) {
      const industries = filters.selections.map(s =>
        s.subNicheName ? `${s.subNicheName}` : s.industryName
      )
      parts.push(industries.join(', '))
    }

    if (filters.city) {
      parts.push(filters.city)
    } else if (filters.country) {
      parts.push(filters.country)
    }

    const conditions: string[] = []
    if (filters.hasEmail) conditions.push('Email')
    if (filters.hasPhone) conditions.push('Phone')
    if (filters.hasWebsite) conditions.push('Website')
    if (filters.verified) conditions.push('Verified')

    if (conditions.length > 0) {
      parts.push(conditions.join(', '))
    }

    if (filters.specialties && filters.specialties.length > 0) {
      parts.push(`${filters.specialties.length} specialties`)
    }

    return parts.length > 0 ? parts.join(' • ') : 'No filters'
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Saved Searches</h1>
        <p className="text-muted-foreground">
          Quickly access and re-run your frequently used searches
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading saved searches...</p>
          </CardContent>
        </Card>
      ) : searches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Save className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Searches</h3>
            <p className="text-muted-foreground mb-4">
              Save your searches for quick access later
            </p>
            <Button onClick={() => router.push('/dashboard/leads')}>
              <Search className="mr-2 h-4 w-4" />
              Search Leads
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searches.map((search) => (
            <Card key={search.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-1 truncate">
                      {search.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3" />
                      Saved {formatDate(search.created_at)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(search.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Filter Summary */}
                  <div className="flex items-start gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      {getFilterSummary(search)}
                    </p>
                  </div>

                  {/* Quality Score Range */}
                  {(search.filters.qualityScoreMin || search.filters.qualityScoreMax) && (
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        Quality: {search.filters.qualityScoreMin || 0}-
                        {search.filters.qualityScoreMax || 100}
                      </Badge>
                    </div>
                  )}

                  {/* Run Search Button */}
                  <Button
                    onClick={() => handleRunSearch(search)}
                    className="w-full mt-2"
                    size="sm"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Run Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Search?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your saved search.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
