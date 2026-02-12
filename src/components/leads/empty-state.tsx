import { Button } from '@/components/ui/button'
import { SearchX, Database, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface EmptyStateProps {
  type?: 'no-results' | 'no-data' | 'no-filters'
  onReset?: () => void
}

export function EmptyState({ type = 'no-results', onReset }: EmptyStateProps) {
  const t = useTranslations('leads.emptyState')

  const configs = {
    'no-results': {
      icon: SearchX,
      title: t('title'),
      description: t('description'),
      action: t('clearButton'),
    },
    'no-data': {
      icon: Database,
      title: t('noData.title'),
      description: t('noData.description'),
      action: t('noData.action'),
    },
    'no-filters': {
      icon: Filter,
      title: t('noFilters.title'),
      description: t('noFilters.description'),
      action: null,
    },
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{config.description}</p>
      {config.action && onReset && (
        <Button onClick={onReset} variant="outline">
          {config.action}
        </Button>
      )}
    </div>
  )
}
