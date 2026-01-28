import { Button } from '@/components/ui/button'
import { SearchX, Database, Filter } from 'lucide-react'

interface EmptyStateProps {
  type?: 'no-results' | 'no-data' | 'no-filters'
  onReset?: () => void
}

export function EmptyState({ type = 'no-results', onReset }: EmptyStateProps) {
  const configs = {
    'no-results': {
      icon: SearchX,
      title: 'No leads found',
      description: 'Try adjusting your filters or search criteria',
      action: 'Clear Filters',
    },
    'no-data': {
      icon: Database,
      title: 'No data available',
      description: 'There is no data for the selected industry yet',
      action: 'Select Different Industry',
    },
    'no-filters': {
      icon: Filter,
      title: 'Select filters to start',
      description: 'Choose an industry and location to find leads',
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
