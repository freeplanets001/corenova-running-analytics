'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Medal,
  CalendarCheck,
  Clock,
  BarChart3,
  TrendingUp,
} from 'lucide-react'

export default function OverviewPage() {
  const { profile, loading } = useAuth()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'おはようございます'
    if (hour < 18) return 'こんにちは'
    return 'こんばんは'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {greeting()}、{profile?.display_name || 'ユーザー'}さん
        </h2>
        <p className="text-muted-foreground">
          チームのパフォーマンス概要を確認しましょう。
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="チーム平均"
          value="54.3秒"
          change="-1.2秒"
          subtitle="前回比"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="ベストパフォーマー"
          value="田中 太郎"
          subtitle="平均 48.7秒"
          icon={Medal}
          trend="up"
        />
        <StatCard
          title="出席率"
          value="92%"
          change="+3%"
          subtitle="先月比"
          icon={CalendarCheck}
          trend="up"
        />
        <StatCard
          title="最近のセッション"
          value="3日前"
          subtitle="ランニングドリル"
          icon={Clock}
          trend="stable"
        />
      </div>

      {/* Charts Section (Coming Soon) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              チーム平均推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              <BarChart3 className="mb-2 h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-xs">セッションデータが蓄積されるとグラフが表示されます</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              個人トレンド
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              <TrendingUp className="mb-2 h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-xs">データが入力されると個人のトレンドが表示されます</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
