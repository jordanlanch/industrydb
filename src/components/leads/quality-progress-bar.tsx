import { CustomProgress } from '@/components/ui/custom-progress'
import { getQualityTier, getQualityTierConfig } from '@/lib/lead-stats'

interface QualityProgressBarProps {
  score: number
  className?: string
}

export function QualityProgressBar({ score, className }: QualityProgressBarProps) {
  const tier = getQualityTier(score)
  const config = getQualityTierConfig(tier)

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">Quality</span>
        <span className="text-xs font-semibold">{score}/100</span>
      </div>
      <CustomProgress
        value={score}
        max={100}
        indicatorClassName={config.barColor}
        className="h-2"
      />
    </div>
  )
}
