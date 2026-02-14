'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/use-auth'
import { ROUTES } from '@/lib/constants/routes'
import { APP_NAME } from '@/lib/constants/config'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { UserRole } from '@/types'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardEdit,
  BarChart3,
  Target,
  Brain,
  Trophy,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  allowedRoles?: UserRole[]
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      {
        label: '概要',
        href: ROUTES.OVERVIEW,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'データ',
    items: [
      {
        label: 'セッション',
        href: ROUTES.SESSIONS,
        icon: CalendarDays,
      },
      {
        label: 'データ入力',
        href: ROUTES.ENTRY,
        icon: ClipboardEdit,
        allowedRoles: ['admin', 'player'],
      },
    ],
  },
  {
    title: '分析',
    items: [
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
    ],
  },
  {
    title: 'その他',
    items: [
      {
        label: 'AI アシスタント',
        href: ROUTES.AI,
        icon: Brain,
        allowedRoles: ['admin', 'player'],
      },
      {
        label: 'ゲーミフィケーション',
        href: ROUTES.GAMIFICATION,
        icon: Trophy,
      },
    ],
  },
  {
    title: '設定',
    items: [
      {
        label: 'プロフィール',
        href: ROUTES.SETTINGS_PROFILE,
        icon: Settings,
      },
      {
        label: 'メンバー管理',
        href: ROUTES.SETTINGS_MEMBERS,
        icon: Shield,
        allowedRoles: ['admin'],
      },
      {
        label: 'AI設定',
        href: ROUTES.SETTINGS_AI,
        icon: Brain,
        allowedRoles: ['admin'],
      },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { role } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === ROUTES.OVERVIEW) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const isItemVisible = (item: NavItem) => {
    if (!item.allowedRoles) return true
    if (!role) return false
    return item.allowedRoles.includes(role)
  }

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Branding */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <Link href={ROUTES.OVERVIEW} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              CN
            </div>
            <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
          </Link>
        )}
        {collapsed && (
          <Link href={ROUTES.OVERVIEW} className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              CN
            </div>
          </Link>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {navSections.map((section, sectionIdx) => {
          const visibleItems = section.items.filter(isItemVisible)
          if (visibleItems.length === 0) return null

          return (
            <div key={sectionIdx} className="mb-4">
              {section.title && !collapsed && (
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {section.title}
                </p>
              )}
              {section.title && collapsed && (
                <Separator className="mb-2" />
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isActive(item.href)
                  const linkContent = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  )

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return linkContent
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <Separator />

      {/* Collapse Toggle */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full', collapsed ? 'px-2' : 'justify-start')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>折りたたむ</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}
