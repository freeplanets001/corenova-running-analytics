'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
} from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/overview': '概要',
  '/sessions': 'セッション',
  '/entry': 'データ入力',
  '/analytics': '分析',
  '/goals': '目標',
  '/ai': 'AI アシスタント',
  '/gamification': 'ゲーミフィケーション',
  '/notifications': '通知',
  '/settings': '設定',
}

function getPageTitle(pathname: string): string {
  // Exact match
  if (pageTitles[pathname]) return pageTitles[pathname]

  // Prefix match (for nested routes)
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title
  }

  return 'CORENOVA'
}

interface TopbarProps {
  onMenuClick?: () => void
  unreadNotifications?: number
}

export function Topbar({ onMenuClick, unreadNotifications = 0 }: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, role } = useAuth()

  const pageTitle = getPageTitle(pathname)

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'ユーザー'
  const avatarUrl = profile?.avatar_url || undefined
  const initials = displayName
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const roleLabels: Record<string, string> = {
    admin: '管理者',
    player: '選手',
    viewer: '閲覧者',
  }

  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = ROUTES.LOGIN
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </Button>
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => router.push(ROUTES.NOTIFICATIONS)}
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </Badge>
          )}
          <span className="sr-only">通知</span>
        </Button>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
                {role && (
                  <Badge variant="secondary" className="w-fit text-[10px]">
                    {roleLabels[role] || role}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS_PROFILE)}>
              <User className="mr-2 h-4 w-4" />
              プロフィール
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS_PROFILE)}>
              <Settings className="mr-2 h-4 w-4" />
              設定
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSignOut() }} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
