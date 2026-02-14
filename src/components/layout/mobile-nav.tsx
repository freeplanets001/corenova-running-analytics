'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/use-auth'
import { ROUTES } from '@/lib/constants/routes'
import type { UserRole } from '@/types'
import {
  LayoutDashboard,
  ClipboardEdit,
  BarChart3,
  Target,
  MoreHorizontal,
} from 'lucide-react'

interface MobileTab {
  label: string
  href: string
  icon: typeof LayoutDashboard
  allowedRoles?: UserRole[]
}

const tabs: MobileTab[] = [
  {
    label: '概要',
    href: ROUTES.OVERVIEW,
    icon: LayoutDashboard,
  },
  {
    label: '入力',
    href: ROUTES.ENTRY,
    icon: ClipboardEdit,
    allowedRoles: ['admin', 'player'],
  },
  {
    label: '分析',
    href: ROUTES.ANALYTICS,
    icon: BarChart3,
  },
  {
    label: '目標',
    href: ROUTES.GOALS,
    icon: Target,
    allowedRoles: ['admin', 'player'],
  },
  {
    label: 'その他',
    href: ROUTES.SETTINGS_PROFILE,
    icon: MoreHorizontal,
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const { role } = useAuth()

  const isActive = (href: string) => {
    if (href === ROUTES.OVERVIEW) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const visibleTabs = tabs.filter(tab => {
    if (!tab.allowedRoles) return true
    if (!role) return false
    return tab.allowedRoles.includes(role)
  })

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {visibleTabs.map((tab) => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className={cn('h-5 w-5', active && 'text-primary')} />
              <span className={cn('font-medium', active && 'text-primary')}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Safe area padding for phones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
