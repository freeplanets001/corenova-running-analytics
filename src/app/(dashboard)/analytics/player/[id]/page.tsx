'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft, Loader2, Activity, Timer, TrendingUp, TrendingDown,
  Target, Hash, Minus,
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface HistoryItem {
  sessionId: string
  date: string
  testType: string
  unit: string
  runs: Array<{ runNumber: number; value: number }>
  average: number
  best: number
  runCount: number
}

interface PlayerData {
  playerId: string
  playerName: string
  jerseyNumber: number | null
  position: string | null
  sessionCount: number
  totalRuns: number
  overallAverage: number
  personalBest: number
  personalWorst: number
  improvement: number
  history: HistoryItem[]
}

export default function PlayerAnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/analytics/player/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('選手が見つかりません'); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="mb-2 h-10 w-10 opacity-30" />
        <p>{error || 'データがありません'}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>戻る</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{data.playerName}</h1>
            {data.jerseyNumber && (
              <Badge variant="outline" className="text-lg">#{data.jerseyNumber}</Badge>
            )}
            {data.position && (
              <Badge variant="secondary">{data.position}</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {data.sessionCount}セッション参加・{data.totalRuns}本計測
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">全体平均</span>
          </div>
          <div className="text-2xl font-bold">{data.overallAverage}秒</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-xs text-muted-foreground">自己ベスト</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{data.personalBest}秒</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            {data.improvement > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> :
             data.improvement < 0 ? <TrendingDown className="h-4 w-4 text-red-600" /> :
             <Minus className="h-4 w-4 text-gray-400" />}
            <span className="text-xs text-muted-foreground">改善</span>
          </div>
          <div className={`text-2xl font-bold ${data.improvement > 0 ? 'text-green-600' : data.improvement < 0 ? 'text-red-600' : ''}`}>
            {data.improvement > 0 ? '+' : ''}{data.improvement}秒
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Hash className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-muted-foreground">総計測</span>
          </div>
          <div className="text-2xl font-bold">{data.totalRuns}本</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">タイムライン</TabsTrigger>
          <TabsTrigger value="sessions">セッション詳細</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">パフォーマンス推移</CardTitle>
            </CardHeader>
            <CardContent>
              {data.history && data.history.length > 0 ? (
                <div className="space-y-3">
                  {data.history.map((s, idx) => {
                    const prev = idx > 0 ? data.history[idx - 1] : null
                    const diff = prev ? Math.round((s.average - prev.average) * 10) / 10 : 0
                    return (
                      <Link
                        key={s.sessionId}
                        href={`/sessions/${s.sessionId}`}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-muted-foreground w-24">
                            {new Date(s.date).toLocaleDateString('ja-JP')}
                          </div>
                          <span className="font-medium">{s.testType}</span>
                          <span className="text-sm text-muted-foreground">{s.runCount}本</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono">平均 {s.average}{s.unit}</span>
                          <span className="font-mono text-green-600">ベスト {s.best}{s.unit}</span>
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
              ) : (
                <p className="text-center text-muted-foreground py-8">データがありません</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">セッション別詳細</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data.history || []).map(s => {
                  const worst = Math.max(...s.runs.map(r => r.value))
                  return (
                    <div key={s.sessionId} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Link href={`/sessions/${s.sessionId}`} className="font-medium hover:underline text-primary">
                          {new Date(s.date).toLocaleDateString('ja-JP')} - {s.testType}
                        </Link>
                        <div className="flex gap-4 text-sm">
                          <span>平均: <strong>{s.average}{s.unit}</strong></span>
                          <span className="text-green-600">ベスト: <strong>{s.best}{s.unit}</strong></span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {s.runs.map(r => (
                          <div
                            key={r.runNumber}
                            className={`rounded-lg border px-3 py-2 text-center text-sm font-mono ${
                              r.value === s.best ? 'bg-green-50 border-green-200 text-green-700' :
                              r.value === worst ? 'bg-red-50 border-red-200 text-red-700' : ''
                            }`}
                          >
                            <div className="text-xs text-muted-foreground mb-1">{r.runNumber}本目</div>
                            <div className="font-semibold">{r.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
