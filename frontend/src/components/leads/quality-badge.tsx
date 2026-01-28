import { Badge } from '@/components/ui/badge'
import { getQualityTier, getQualityTierConfig } from '@/lib/lead-stats'
import { cn } from '@/lib/utils'

interface QualityBadgeProps {
  score: number
  className?: string
  showScore?: boolean
}

export function QualityBadge({ score, className, showScore = true }: QualityBadgeProps) {
  const tier = getQualityTier(score)
  const config = getQualityTierConfig(tier)

  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-semibold',
        config.bgColor,
        'text-white',
        className
      )}
    >
      {config.label}
      {showScore && ` (${score})`}
    </Badge>
  )
}
