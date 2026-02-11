'use client'

import { useEffect } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Database, FileDown, Activity, Building2, Settings, LogOut, Key, ChevronLeft, ChevronRight, Shield, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { OrganizationSwitcher } from '@/components/organization/organization-switcher'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslations } from 'next-intl'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ isOpen, onToggle, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const t = useTranslations('nav')

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('leads'), href: '/dashboard/leads', icon: Database },
    { name: t('exports'), href: '/dashboard/exports', icon: FileDown },
    { name: t('analytics'), href: '/dashboard/analytics', icon: Activity },
    { name: t('organizations'), href: '/dashboard/organizations', icon: Building2 },
    { name: t('apiKeys'), href: '/dashboard/api-keys', icon: Key },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
  ]

  // Close mobile drawer on route change
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Shared nav content for both desktop and mobile
  const renderNavLinks = (showLabels: boolean) => (
    <>
      {navigation.map((item) => {
        const isActive = item.href === '/dashboard'
          ? pathname === item.href || pathname === item.href + '/'
          : pathname === item.href || pathname?.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`${item.name} page`}
            title={!showLabels ? item.name : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground',
              !showLabels && 'justify-center'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {showLabels && <span className="truncate">{item.name}</span>}
          </Link>
        )
      })}

      {/* Admin Panel Link (only for admin/superadmin) */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <>
          {showLabels && <div className="border-t my-2" />}
          <Link
            href="/admin"
            aria-current={pathname?.startsWith('/admin') ? 'page' : undefined}
            aria-label={t('adminPanel')}
            title={!showLabels ? t('adminPanel') : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              pathname?.startsWith('/admin')
                ? 'bg-destructive text-destructive-foreground'
                : 'text-destructive hover:bg-red-50 hover:text-destructive',
              !showLabels && 'justify-center'
            )}
          >
            <Shield className="h-5 w-5 shrink-0" aria-hidden="true" />
            {showLabels && <span className="truncate">{t('adminPanel')}</span>}
          </Link>
        </>
      )}

      {/* API Documentation Link (only for business tier) */}
      {user?.subscription_tier === 'business' && (
        <>
          {showLabels && <div className="border-t my-2" />}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7890'}/swagger/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t('apiDocs')} (opens in new tab)`}
            title={!showLabels ? t('apiDocs') : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'text-muted-foreground hover:bg-gray-100 hover:text-foreground',
              !showLabels && 'justify-center'
            )}
          >
            <BookOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
            {showLabels && <span className="truncate">{t('apiDocs')}</span>}
          </a>
        </>
      )}
    </>
  )

  return (
    <>
      {/* ============ DESKTOP SIDEBAR ============ */}
      <aside
        className={cn(
          "relative hidden md:flex h-full flex-col border-r bg-gray-50 transition-all duration-300 ease-in-out",
          isOpen ? "w-[200px]" : "w-16"
        )}
        aria-label="Main navigation"
      >
        {/* Toggle Button - desktop only */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-white border shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={isOpen ? t('collapseSidebar') : t('expandSidebar')}
          title={isOpen ? `${t('collapseSidebar')} (⌘B)` : `${t('expandSidebar')} (⌘B)`}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b transition-all",
          isOpen ? "px-6 justify-start" : "px-0 justify-center"
        )}>
          <h1 className={cn(
            "font-bold transition-all",
            isOpen ? "text-xl" : "text-lg"
          )}>
            <Link
              href="/dashboard"
              className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              {isOpen ? 'IndustryDB' : 'IDB'}
            </Link>
          </h1>
        </div>

        {/* Organization Switcher */}
        {isOpen && (
          <div className="px-3 pt-4 pb-2 border-b">
            <OrganizationSwitcher showCreateButton={true} />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Dashboard navigation">
          {renderNavLinks(isOpen)}
        </nav>

        {/* Footer - expanded */}
        {isOpen && (
          <div className="border-t p-4">
            <div className="mb-3 px-3" role="region" aria-label="User information">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <p className="mt-1 text-xs">
                <span className="font-medium capitalize">{t('plan', { tier: user?.subscription_tier })}</span>
              </p>
            </div>
            <div className="mb-3 px-3">
              <LanguageSwitcher variant="light" />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
              aria-label={t('logout')}
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('logout')}
            </Button>
          </div>
        )}

        {/* Footer - collapsed */}
        {!isOpen && (
          <div className="border-t p-2">
            <div className="mb-2">
              <LanguageSwitcher variant="light" compact />
            </div>
            <Button
              variant="ghost"
              className="w-full p-2"
              onClick={handleLogout}
              aria-label={t('logout')}
              title={t('logout')}
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        )}
      </aside>

      {/* ============ MOBILE DRAWER ============ */}
      {/* Overlay backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Slide-in drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[280px] flex flex-col bg-gray-50 border-r shadow-xl transition-transform duration-300 ease-in-out md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        {/* Mobile header with close button */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <h1 className="text-xl font-bold">
            <Link
              href="/dashboard"
              className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              IndustryDB
            </Link>
          </h1>
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organization Switcher */}
        <div className="px-3 pt-4 pb-2 border-b">
          <OrganizationSwitcher showCreateButton={true} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" aria-label="Mobile dashboard navigation">
          {renderNavLinks(true)}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="mb-3 px-3" role="region" aria-label="User information">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <p className="mt-1 text-xs">
              <span className="font-medium capitalize">{t('plan', { tier: user?.subscription_tier })}</span>
            </p>
          </div>
          <div className="mb-3 px-3">
            <LanguageSwitcher variant="light" />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
            aria-label={t('logout')}
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('logout')}
          </Button>
        </div>
      </aside>
    </>
  )
}
