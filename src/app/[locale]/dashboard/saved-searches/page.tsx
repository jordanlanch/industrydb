/**
 * Saved Searches Page
 * Manage and re-run saved searches
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('savedSearches')
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
        title: t('toast.loadFailed'),
        description: t('toast.loadFailedDesc'),
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
      title: t('toast.applied'),
      description: t('toast.appliedDesc', { name: search.name }),
      variant: 'default',
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await savedSearchesService.delete(deleteId)

      toast({
        title: t('toast.deleted'),
        description: t('toast.deletedDesc'),
        variant: 'default',
      })

      // Reload searches
      await loadSearches()
      setDeleteId(null)
    } catch (error) {
      toast({
        title: t('toast.deleteFailed'),
        description: t('toast.deleteFailedDesc'),
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
      parts.push(t('filters.specialties', { count: filters.specialties.length }))
    }

    return parts.length > 0 ? parts.join(' • ') : t('filters.noFilters')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-4 sm:pt-6 lg:pt-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t('loading')}</p>
          </CardContent>
        </Card>
      ) : searches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Save className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('empty.description')}
            </p>
            <Button onClick={() => router.push('/dashboard/leads')}>
              <Search className="mr-2 h-4 w-4" />
              {t('empty.createButton')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      {t('card.saved', { date: formatDate(search.created_at) })}
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
                        {t('filters.qualityRange', {
                          min: search.filters.qualityScoreMin || 0,
                          max: search.filters.qualityScoreMax || 100
                        })}
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
                    {t('card.runButton')}
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
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? t('delete.deleting') : t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
