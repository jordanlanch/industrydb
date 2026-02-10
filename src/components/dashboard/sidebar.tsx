'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Database, FileDown, Activity, Building2, Settings, LogOut, Key, ChevronLeft, ChevronRight, Shield, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
import { OrganizationSwitcher } from '@/components/organization/organization-switcher'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslations } from 'next-intl'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
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

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r bg-gray-50 transition-all duration-300 ease-in-out",
        isOpen ? "w-[200px]" : "w-16"
      )}
      aria-label="Main navigation"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-white border shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={isOpen ? t('collapseSidebar') : t('expandSidebar')}
        title={isOpen ? `${t('collapseSidebar')} (⌘B)` : `${t('expandSidebar')} (⌘B)`}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 m-auto" />
        ) : (
          <ChevronRight className="h-4 w-4 m-auto" />
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
              title={!isOpen ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground',
                !isOpen && 'justify-center'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {isOpen && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}

        {/* Admin Panel Link (only for admin/superadmin) */}
        {(user?.role === 'admin' || user?.role === 'superadmin') && (
          <>
            {isOpen && <div className="border-t my-2" />}
            <Link
              href="/admin"
              aria-current={pathname?.startsWith('/admin') ? 'page' : undefined}
              aria-label={t('adminPanel')}
              title={!isOpen ? t('adminPanel') : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                pathname?.startsWith('/admin')
                  ? 'bg-destructive text-destructive-foreground'
                  : 'text-destructive hover:bg-red-50 hover:text-destructive',
                !isOpen && 'justify-center'
              )}
            >
              <Shield className="h-5 w-5 shrink-0" aria-hidden="true" />
              {isOpen && <span className="truncate">{t('adminPanel')}</span>}
            </Link>
          </>
        )}

        {/* API Documentation Link (only for business tier) */}
        {user?.subscription_tier === 'business' && (
          <>
            {isOpen && <div className="border-t my-2" />}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7890'}/swagger/index.html`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('apiDocs')} (opens in new tab)`}
              title={!isOpen ? t('apiDocs') : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'text-muted-foreground hover:bg-gray-100 hover:text-foreground',
                !isOpen && 'justify-center'
              )}
            >
              <BookOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
              {isOpen && <span className="truncate">{t('apiDocs')}</span>}
            </a>
          </>
        )}
      </nav>

      {/* Footer */}
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

      {/* Collapsed Footer - Logout Icon Only */}
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
  )
}
