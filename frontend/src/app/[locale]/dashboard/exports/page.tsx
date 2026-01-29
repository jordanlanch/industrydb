'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { exportsService } from '@/services/exports.service'
import type { Export } from '@/types'
import { Download, FileText, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function ExportsPage() {
  const t = useTranslations('exports')
  const [exports, setExports] = useState<Export[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadExports()
  }, [])

  const loadExports = async () => {
    setLoading(true)
    try {
      const response = await exportsService.list(1, 50)
      setExports(response.data || [])
    } catch (error) {
      console.error('Failed to load exports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Export['status']) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />{t('status.ready')}</Badge>
      case 'processing':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />{t('status.processing')}</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t('status.pending')}</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t('status.failed')}</Badge>
    }
  }

  const handleDownload = (exportId: number) => {
    const url = exportsService.getDownloadUrl(exportId)
    window.open(url, '_blank')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={loadExports} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('refresh')}
        </Button>
      </div>

      {loading && exports.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
            </div>
          </CardContent>
        </Card>
      ) : exports.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('noExports')}</p>
              <p className="text-sm">{t('createFirst')}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exports.map((exp) => (
            <Card key={exp.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {t('exportNumber', { id: exp.id, format: exp.format.toUpperCase() })}
                  </CardTitle>
                  {getStatusBadge(exp.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('details.leads')}</p>
                    <p className="font-medium">{exp.lead_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('details.created')}</p>
                    <p className="font-medium">{formatDate(exp.created_at)}</p>
                  </div>
                  {exp.expires_at && (
                    <div>
                      <p className="text-muted-foreground">{t('details.expires')}</p>
                      <p className="font-medium">{formatDate(exp.expires_at)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">{t('details.status')}</p>
                    <p className="font-medium capitalize">{exp.status}</p>
                  </div>
                </div>

                {exp.error_message && (
                  <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm mb-4">
                    {exp.error_message}
                  </div>
                )}

                {exp.status === 'ready' && exp.file_url && (
                  <Button onClick={() => handleDownload(exp.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('download')}
                  </Button>
                )}

                {exp.status === 'processing' && (
                  <p className="text-sm text-muted-foreground">
                    {t('processingMsg')}
                  </p>
                )}

                {exp.status === 'pending' && (
                  <p className="text-sm text-muted-foreground">
                    {t('pendingMsg')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
