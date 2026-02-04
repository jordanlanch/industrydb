'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { EmailVerificationBanner } from '@/components/email-verification-banner'
import { DashboardErrorBoundary } from '@/components/error-boundary'
import { useAuthStore } from '@/store/auth.store'
import { useSidebarState } from '@/hooks/useSidebarState'
import { OrganizationProvider } from '@/contexts/organization.context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore()
  const { isMainSidebarOpen, toggleMainSidebar } = useSidebarState()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B = Toggle Main Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleMainSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleMainSidebar])

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

  if (!isAuthenticated) {
    return null
  }

  return (
    <OrganizationProvider>
      <div className="flex h-screen flex-col">
        {/* Email verification banner */}
        {user && !user.email_verified && (
          <EmailVerificationBanner email={user.email} />
        )}

        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isMainSidebarOpen} onToggle={toggleMainSidebar} />
          <main className="flex-1 overflow-y-auto bg-white">
            <DashboardErrorBoundary>
              {children}
            </DashboardErrorBoundary>
          </main>
        </div>
      </div>
    </OrganizationProvider>
  )
}
