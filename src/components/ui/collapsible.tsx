/**
 * Collapsible Component
 * Based on shadcn/ui collapsible component
 */
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const CollapsibleContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, open: controlledOpen, onOpenChange, children, ...props }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = React.useCallback(
      (newOpen: boolean) => {
        if (controlledOpen === undefined) {
          setUncontrolledOpen(newOpen)
        }
        onOpenChange?.(newOpen)
      },
      [controlledOpen, onOpenChange]
    )

    return (
      <CollapsibleContext.Provider value={{ open, setOpen }}>
        <div ref={ref} className={cn(className)} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)
Collapsible.displayName = 'Collapsible'

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, children, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext)

  if (!context) {
    throw new Error('CollapsibleTrigger must be used within Collapsible')
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.setOpen(!context.open)
    onClick?.(e)
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center justify-between py-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext)

  if (!context) {
    throw new Error('CollapsibleContent must be used within Collapsible')
  }

  if (!context.open) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn('overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  )
})
CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
