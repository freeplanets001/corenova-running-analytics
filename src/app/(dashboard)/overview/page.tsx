'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TeamAverageLineChart } from '@/components/charts/team-average-line'
import {
  Users,
  Medal,
  CalendarCheck,
  Clock,
  TrendingUp,
  Activity,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  team: { id: string; name: string }
  stats: {
    sessionCount: number
    playerCount: number
    totalRuns: number
    latestSession: {
      date: string
      teamAverage: number
      playerCount: number
      avgChange: number
    } | null
    bestPerformer: {
      playerId: string
      playerName: string
      overallAverage: number
      sessionsAttended: number
    } | null
    attendanceRate: number
  }
  sessions: Array<{
    id: string
    date: string
    testType: string
    unit: string
    playerCount: number
    teamAverage: number
    teamMin: number
    teamMax: number
  }>
  rankings: Array<{
    playerId: string
    playerName: string
    overallAverage: number
    sessionsAttended: number
  }>
}

export default function OverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/overview')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => setError('データの取得に失敗しました'))
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'おはようございます'
    if (hour < 18) return 'こんにちは'
    return 'こんばんは'
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="mb-2 h-10 w-10 opacity-30" />
        <p>{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const { stats, sessions, rankings } = data
  const daysAgo = stats.latestSession
    ? Math.floor((Date.now() - new Date(stats.latestSession.date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Chart data
  const chartData = [...sessions].reverse().map(s => ({
    date: s.date,
    teamAverage: s.teamAverage,
    teamMin: s.teamMin,
    teamMax: s.teamMax,
    playerCount: s.playerCount,
  }))

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {greeting()}
        </h2>
        <p className="text-muted-foreground">
          {data.team.name} のパフォーマンス概要
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="チーム平均"
          value={stats.latestSession ? `${stats.latestSession.teamAverage}秒` : '-'}
          change={stats.latestSession?.avgChange ? `${stats.latestSession.avgChange > 0 ? '+' : ''}${stats.latestSession.avgChange}秒` : undefined}
          subtitle="前回比"
          icon={Users}
          trend={stats.latestSession?.avgChange && stats.latestSession.avgChange < 0 ? 'up' : stats.latestSession?.avgChange && stats.latestSession.avgChange > 0 ? 'down' : 'stable'}
        />
        <StatCard
          title="ベストパフォーマー"
          value={stats.bestPerformer?.playerName || '-'}
          subtitle={stats.bestPerformer ? `平均 ${stats.bestPerformer.overallAverage}秒` : ''}
          icon={Medal}
          trend="up"
        />
        <StatCard
          title="出席率"
          value={`${stats.attendanceRate}%`}
          subtitle={`${stats.playerCount}名登録`}
          icon={CalendarCheck}
          trend={stats.attendanceRate >= 80 ? 'up' : 'down'}
        />
        <StatCard
          title="最近のセッション"
          value={daysAgo !== null ? (daysAgo === 0 ? '今日' : `${daysAgo}日前`) : '-'}
          subtitle={`全${stats.sessionCount}回`}
          icon={Clock}
          trend="stable"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              チーム平均推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <TeamAverageLineChart data={chartData} />
            ) : (
              <div className="flex h-[240px] items-center justify-center text-muted-foreground">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Medal className="h-5 w-5 text-muted-foreground" />
              トップ5ランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.map((player, idx) => (
                <Link
                  key={player.playerId}
                  href={`/analytics/player/${player.playerId}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium">{player.playerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{player.overallAverage}秒</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {player.sessionsAttended}/{stats.sessionCount}回参加
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近のセッション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessions.slice(0, 5).map(s => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div>
                  <span className="font-medium">{new Date(s.date).toLocaleDateString('ja-JP')}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{s.testType}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{s.playerCount}名</span>
                  <span className="font-bold">{s.teamAverage}{s.unit}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
