'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Activity, LineChart, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

interface TrendItem {
  sessionId: string
  date: string
  testType: string
  unit: string
  average: number
  best: number
  playerCount: number
}

interface TeamData {
  sessionCount: number
  totalRuns: number
  overallAverage: number
  overallBest: number
  trend: TrendItem[]
}

export default function TrendsPage() {
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

  if (!data || !data.trend?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="mb-2 h-10 w-10 opacity-30" />
        <p>データがありません</p>
      </div>
    )
  }

  const trend = data.trend
  const firstHalf = trend.slice(0, Math.ceil(trend.length / 2))
  const secondHalf = trend.slice(Math.ceil(trend.length / 2))
  const firstAvg = firstHalf.reduce((s, t) => s + t.average, 0) / firstHalf.length
  const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((s, t) => s + t.average, 0) / secondHalf.length : firstAvg
  const teamImprovement = Math.round((firstAvg - secondAvg) * 10) / 10

  // Sparkline for team trend
  const SparkLine = ({ items }: { items: TrendItem[] }) => {
    if (items.length < 2) return null
    const min = Math.min(...items.map(t => t.average))
    const max = Math.max(...items.map(t => t.average))
    const range = max - min || 1
    const width = 300
    const height = 60
    const points = items.map((t, i) => {
      const x = (i / (items.length - 1)) * width
      const y = height - ((t.average - min) / range) * (height - 10) - 5
      return `${x},${y}`
    }).join(' ')
    const isImproving = items[items.length - 1].average < items[0].average
    return (
      <svg width={width} height={height} className="w-full">
        <polyline points={points} fill="none" stroke={isImproving ? '#16a34a' : '#dc2626'} strokeWidth="2.5" />
        {items.map((t, i) => {
          const x = (i / (items.length - 1)) * width
          const y = height - ((t.average - min) / range) * (height - 10) - 5
          return <circle key={i} cx={x} cy={y} r="3" fill={isImproving ? '#16a34a' : '#dc2626'} />
        })}
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <LineChart className="h-8 w-8 text-purple-600" />
          トレンド分析
        </h1>
        <p className="text-muted-foreground mt-2">
          {data.sessionCount}セッションのパフォーマンス推移
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">全体平均</div>
          <div className="text-3xl font-bold">{data.overallAverage}秒</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">全体ベスト</div>
          <div className="text-3xl font-bold text-green-600">{data.overallBest}秒</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-muted-foreground">チーム改善</span>
          </div>
          <div className={`text-3xl font-bold ${teamImprovement > 0 ? 'text-green-600' : teamImprovement < 0 ? 'text-red-600' : ''}`}>
            {teamImprovement > 0 ? '+' : ''}{teamImprovement}秒
          </div>
          <div className="text-xs text-muted-foreground">前半 vs 後半</div>
        </Card>
      </div>

      {/* Team Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">チーム平均タイム推移</CardTitle>
        </CardHeader>
        <CardContent>
          <SparkLine items={trend} />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{new Date(trend[0].date).toLocaleDateString('ja-JP')}</span>
            <span>{new Date(trend[trend.length - 1].date).toLocaleDateString('ja-JP')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Session-by-Session Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">セッション詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...trend].reverse().map((s, idx) => {
              const prev = idx < trend.length - 1 ? [...trend].reverse()[idx + 1] : null
              const diff = prev ? Math.round((s.average - prev.average) * 10) / 10 : 0
              return (
                <Link
                  key={s.sessionId}
                  href={`/sessions/${s.sessionId}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">
                      {new Date(s.date).toLocaleDateString('ja-JP')}
                    </span>
                    <span className="font-medium">{s.testType}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />{s.playerCount}名
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold">{s.average}{s.unit}</span>
                    <span className="font-mono text-green-600 text-sm">ベスト {s.best}</span>
                    {prev && diff !== 0 && (
                      <span className={`text-sm font-mono ${diff < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
