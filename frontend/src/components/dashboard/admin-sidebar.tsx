'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Database,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Leads', href: '/dashboard/leads', icon: Database },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r bg-gray-900 text-white transition-all duration-300 ease-in-out",
        isOpen ? "w-[240px]" : "w-16"
      )}
      aria-label="Admin navigation"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-white border shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        title={isOpen ? "Collapse sidebar (⌘B)" : "Expand sidebar (⌘B)"}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 m-auto text-gray-900" />
        ) : (
          <ChevronRight className="h-4 w-4 m-auto text-gray-900" />
        )}
      </button>

      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-gray-700 transition-all",
        isOpen ? "px-6 justify-start" : "px-0 justify-center"
      )}>
        <h1 className={cn(
          "font-bold transition-all flex items-center gap-2",
          isOpen ? "text-xl" : "text-lg"
        )}>
          <Link
            href="/admin"
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center gap-2"
          >
            <Shield className="h-5 w-5" />
            {isOpen && 'Admin Panel'}
          </Link>
        </h1>
      </div>

      {/* User Info */}
      {isOpen && user && (
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="text-sm font-medium truncate">{user.name}</div>
          <div className="text-xs text-gray-400 truncate">{user.email}</div>
          <div className="mt-1">
            <span className={cn(
              "inline-block px-2 py-0.5 rounded text-xs font-medium",
              user.role === 'superadmin'
                ? "bg-red-500/20 text-red-400"
                : "bg-blue-500/20 text-blue-400"
            )}>
              {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.name} page`}
              title={!isOpen ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                !isOpen && 'justify-center'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {isOpen && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Return to Dashboard Link */}
      <div className="border-t border-gray-700 px-3 py-3">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary',
            !isOpen && 'justify-center'
          )}
          title={!isOpen ? "Back to Dashboard" : undefined}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden="true" />
          {isOpen && <span>Back to Dashboard</span>}
        </Link>
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-700 px-3 py-3">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary',
            !isOpen && 'justify-center'
          )}
          aria-label="Logout"
          title={!isOpen ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
