import * as React from 'react'
import { cn } from '@/lib/utils'

interface CustomProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  className?: string
  indicatorClassName?: string
  showLabel?: boolean
}

const CustomProgress = React.forwardRef<HTMLDivElement, CustomProgressProps>(
  ({ value, max = 100, className, indicatorClassName, showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div
        ref={ref}
        className={cn('relative h-4 w-full overflow-hidden rounded-full bg-gray-200', className)}
        {...props}
      >
        <div
          className={cn('h-full transition-all duration-300 ease-in-out', indicatorClassName)}
          style={{ width: `${percentage}%` }}
        />
        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)

CustomProgress.displayName = 'CustomProgress'

export { CustomProgress }
