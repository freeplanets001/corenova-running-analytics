'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, Medal, Activity, Loader2, BarChart3, TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { TeamAverageLineChart } from '@/components/charts/team-average-line'

interface TrendItem {
  sessionId: string
  date: string
  testType: string
  unit: string
  average: number
  best: number
  playerCount: number
}

interface TopPlayer {
  playerId: string
  playerName: string
  average: number
  runCount: number
  rank: number
}

interface TeamData {
  teamId: string
  sessionCount: number
  totalRuns: number
  totalPlayers: number
  overallAverage: number
  overallBest: number
  trend: TrendItem[]
  topPlayers: TopPlayer[]
}

export default function TeamAnalyticsPage() {
  const [data, setData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/team')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data || !data.trend || !data.trend.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="mb-2 h-10 w-10 opacity-30" />
        <p>データがありません</p>
      </div>
    )
  }

  const latestSession = data.trend[data.trend.length - 1]
  const unit = latestSession.unit || '秒'

  const chartData = data.trend.map(s => ({
    date: s.date,
    teamAverage: s.average,
    teamMin: s.best,
    teamMax: s.average,
    playerCount: s.playerCount,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">チーム分析</h1>
        <p className="text-muted-foreground mt-2">
          全{data.sessionCount}セッション・{data.totalPlayers}名・{data.totalRuns}本のデータ
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-muted-foreground">全体平均</span>
          </div>
          <div className="text-3xl font-bold">{data.overallAverage}{unit}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">全体ベスト</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{data.overallBest}{unit}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Medal className="h-5 w-5 text-yellow-600" />
            <span className="text-sm text-muted-foreground">ベストパフォーマー</span>
          </div>
          <div className="text-xl font-bold">{data.topPlayers[0]?.playerName || '-'}</div>
          <div className="text-sm text-muted-foreground">{data.topPlayers[0]?.average || '-'}{unit}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-muted-foreground">最新セッション</span>
          </div>
          <div className="text-xl font-bold">{latestSession.average}{unit}</div>
          <div className="text-sm text-muted-foreground">{latestSession.playerCount}名参加</div>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">チーム平均推移</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamAverageLineChart data={chartData} />
        </CardContent>
      </Card>

      {/* Player Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">トップ10選手ランキング</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.topPlayers.map((player, idx) => (
              <Link
                key={player.playerId}
                href={`/analytics/player/${player.playerId}`}
                className={`flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors ${idx < 3 ? 'bg-accent/30' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {idx === 0 ? <Badge className="bg-yellow-500">1</Badge> :
                     idx === 1 ? <Badge className="bg-gray-400">2</Badge> :
                     idx === 2 ? <Badge className="bg-orange-600">3</Badge> :
                     <span className="text-muted-foreground">{idx + 1}</span>}
                  </div>
                  <span className="font-medium">{player.playerName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono">{player.average}{unit}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{player.runCount}本</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">セッション履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...data.trend].reverse().map(s => (
              <Link key={s.sessionId} href={`/sessions/${s.sessionId}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div>
                  <span className="font-medium">{new Date(s.date).toLocaleDateString('ja-JP')}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{s.testType}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{s.playerCount}名</span>
                  <span className="font-bold">{s.average}{s.unit}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
