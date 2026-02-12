import { Button } from '@/components/ui/button'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export type ViewMode = 'card' | 'table'

interface LeadViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

export function LeadViewToggle({ mode, onChange, className }: LeadViewToggleProps) {
  const t = useTranslations('leads.viewMode')

  return (
    <div className={cn('inline-flex rounded-lg border bg-background p-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('card')}
        className={cn(
          'px-3 py-1.5 h-auto',
          mode === 'card' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
        )}
      >
        <LayoutGrid className="h-4 w-4 mr-1.5" />
        {t('card')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('table')}
        className={cn(
          'px-3 py-1.5 h-auto',
          mode === 'table' && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
        )}
      >
        <LayoutList className="h-4 w-4 mr-1.5" />
        {t('table')}
      </Button>
    </div>
  )
}
