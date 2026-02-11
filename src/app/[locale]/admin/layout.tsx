'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/routing'
import { useAuthStore } from '@/store/auth.store'
import { AdminSidebar } from '@/components/dashboard/admin-sidebar'
import { DashboardErrorBoundary } from '@/components/error-boundary'
import { useSidebarState } from '@/hooks/useSidebarState'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore()
  const { isMainSidebarOpen, toggleMainSidebar } = useSidebarState()

  // Initialize auth state
  useEffect(() => {
    initialize()
  }, [initialize])

  // Check authentication and admin role
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Not authenticated - redirect to login
      router.push('/login')
    } else if (!isLoading && isAuthenticated && user) {
      // Authenticated but check admin role
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        // Not an admin - redirect to dashboard
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B = Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleMainSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleMainSidebar])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or not admin - return null while redirecting
  if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }

  // Render admin layout
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar isOpen={isMainSidebarOpen} onToggle={toggleMainSidebar} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <DashboardErrorBoundary>
          {children}
        </DashboardErrorBoundary>
      </main>
    </div>
  )
}
