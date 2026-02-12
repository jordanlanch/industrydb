/**
 * Save Search Dialog Component
 * Dialog for saving current search filters
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/toast-provider'
import { Save } from 'lucide-react'
import type { FilterState } from '../leads/advanced-filter-panel'

interface SaveSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onSave?: () => void
}

export function SaveSearchDialog({
  open,
  onOpenChange,
  filters,
  onSave,
}: SaveSearchDialogProps) {
  const t = useTranslations('components.saveSearch')
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: t('nameRequired'),
        description: t('nameRequiredDesc'),
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/v1/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          filters,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || t('saveFailedDesc'))
      }

      toast({
        title: t('saved'),
        description: t('savedDesc', { name }),
        variant: 'default',
      })

      setName('')
      onOpenChange(false)
      onSave?.()
    } catch (error: any) {
      toast({
        title: t('saveFailed'),
        description: error.message || t('saveFailedDesc'),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Get filter summary for display
  const getFilterSummary = () => {
    const parts: string[] = []

    if (filters.selections.length > 0) {
      const industries = filters.selections.map(s =>
        s.subNicheName ? `${s.subNicheName} (${s.industryName})` : s.industryName
      )
      parts.push(industries.join(', '))
    }

    if (filters.city) {
      parts.push(filters.city)
    } else if (filters.country) {
      parts.push(filters.country)
    }

    if (filters.hasEmail) parts.push(t('hasEmail'))
    if (filters.hasPhone) parts.push(t('hasPhone'))
    if (filters.verified) parts.push(t('verified'))

    if (filters.qualityScoreMin || filters.qualityScoreMax) {
      const min = filters.qualityScoreMin || 0
      const max = filters.qualityScoreMax || 100
      parts.push(t('quality', { min, max }))
    }

    if (filters.specialties && filters.specialties.length > 0) {
      parts.push(t('specialties', { count: filters.specialties.length }))
    }

    return parts.length > 0 ? parts.join(' • ') : t('noFilters')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="search-name">{t('nameLabel')}</Label>
            <Input
              id="search-name"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t('nameHint')}
            </p>
          </div>

          {/* Filter Summary */}
          <div className="space-y-2">
            <Label>{t('currentFilters')}</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                {getFilterSummary()}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? t('saving') : t('saveButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
