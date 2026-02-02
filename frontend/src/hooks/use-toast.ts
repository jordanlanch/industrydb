import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...props, id }
    setToasts((prev) => [...prev, newToast])

    // Duration based on variant type for better UX
    // Success: 3s (quick confirmation)
    // Error: 5s (need time to read error)
    // Warning: 5s (important to notice)
    // Info: 4s (moderate importance)
    // Default: 4s (standard)
    const duration = props.duration || (() => {
      switch (props.variant) {
        case 'success':
          return 3000
        case 'destructive':
          return 5000
        case 'warning':
          return 5000
        case 'info':
          return 4000
        default:
          return 4000
      }
    })()

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, toast, dismiss }
}
