import { CustomProgress } from '@/components/ui/custom-progress'
import { calculateCompleteness, getProgressColor } from '@/lib/lead-stats'
import type { Lead } from '@/types'
import { CheckCircle } from 'lucide-react'

interface CompletenessIndicatorProps {
  lead: Lead
  className?: string
  showProgress?: boolean
}

export function CompletenessIndicator({ lead, className, showProgress = true }: CompletenessIndicatorProps) {
  const { filledFields, totalFields, percentage } = calculateCompleteness(lead)

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Completeness: {filledFields}/{totalFields} ({percentage}%)
        </span>
      </div>
      {showProgress && (
        <CustomProgress
          value={percentage}
          indicatorClassName={getProgressColor(percentage)}
          className="h-1.5"
        />
      )}
    </div>
  )
}
