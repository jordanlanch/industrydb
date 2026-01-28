'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Database, FileDown, Activity, Building2, Settings, LogOut, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Leads', href: '/dashboard/leads', icon: Database },
  { name: 'Exports', href: '/dashboard/exports', icon: FileDown },
  { name: 'Analytics', href: '/dashboard/analytics', icon: Activity },
  { name: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside
      className="flex h-screen w-64 flex-col border-r bg-gray-50"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">
          <Link href="/dashboard" className="focus:outline-none focus:ring-2 focus:ring-primary rounded">
            IndustryDB
          </Link>
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Dashboard navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.name} page`}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 px-3" role="region" aria-label="User information">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="mt-1 text-xs">
            <span className="font-medium capitalize">{user?.subscription_tier}</span> plan
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
          aria-label="Logout from account"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
