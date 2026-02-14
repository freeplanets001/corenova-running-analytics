'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Calendar, MapPin, Timer, Lock, Unlock, Download,
  Search, ArrowLeft, Loader2, Activity, Users,
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface PlayerResult {
  playerId: string
  playerName: string
  runs: Array<{ runNumber: number; value: number }>
  average: number
  best: number
  worst: number
  runCount: number
  rank: number
}

interface SessionDetail {
  id: string
  date: string
  testType: string
  unit: string
  direction: string
  isLocked: boolean
  notes: string | null
  location: string | null
  playerCount: number
  players: PlayerResult[]
}

export default function SessionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/sessions/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(data => {
        setSession(data)
        setLoading(false)
      })
      .catch(() => {
        setError('セッションが見つかりません')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="mb-2 h-10 w-10 opacity-30" />
        <p>{error || 'データがありません'}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/sessions')}>
          セッション一覧に戻る
        </Button>
      </div>
    )
  }

  const filteredPlayers = session.players.filter(p =>
    p.playerName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const allValues = session.players.flatMap(p => p.runs.map(r => r.value))
  const overallAvg = allValues.length > 0
    ? Math.round((allValues.reduce((a: number, b: number) => a + b, 0) / allValues.length) * 10) / 10
    : 0
  const overallBest = allValues.length > 0 ? Math.round(Math.min(...allValues) * 10) / 10 : 0
  const overallWorst = allValues.length > 0 ? Math.round(Math.max(...allValues) * 10) / 10 : 0
  const maxRuns = Math.max(...session.players.map(p => p.runCount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{session.testType}</h1>
              {session.isLocked ? (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" /> ロック済み
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Unlock className="h-3 w-3" /> 編集可能
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {new Date(session.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> エクスポート
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">測定日</div>
              <div className="font-medium">{new Date(session.date).toLocaleDateString('ja-JP')}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">測定種目</div>
              <div className="font-medium">{session.testType}</div>
            </div>
          </div>
          {session.location && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">場所</div>
                <div className="font-medium">{session.location}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">参加人数</div>
              <div className="font-medium">{session.playerCount}名</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">全体平均</div>
          <div className="text-3xl font-bold">{overallAvg}{session.unit}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">ベスト</div>
          <div className="text-3xl font-bold text-green-600">{overallBest}{session.unit}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">ワースト</div>
          <div className="text-3xl font-bold text-red-600">{overallWorst}{session.unit}</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">測定結果</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="選手名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">順位</th>
                <th className="text-left p-3 font-semibold">選手名</th>
                {Array.from({ length: maxRuns }, (_, i) => (
                  <th key={i} className="text-center p-3 font-semibold">{i + 1}本目</th>
                ))}
                <th className="text-center p-3 font-semibold">平均</th>
                <th className="text-center p-3 font-semibold">ベスト</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr
                  key={player.playerId}
                  className={`border-b hover:bg-accent transition-colors ${player.rank <= 3 ? 'bg-accent/30' : ''}`}
                >
                  <td className="p-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {player.rank === 1 ? (
                        <Badge className="bg-yellow-500">1</Badge>
                      ) : player.rank === 2 ? (
                        <Badge className="bg-gray-400">2</Badge>
                      ) : player.rank === 3 ? (
                        <Badge className="bg-orange-600">3</Badge>
                      ) : (
                        <span className="text-muted-foreground">{player.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/analytics/player/${player.playerId}`}
                      className="font-medium hover:underline text-primary"
                    >
                      {player.playerName}
                    </Link>
                  </td>
                  {Array.from({ length: maxRuns }, (_, i) => {
                    const run = player.runs.find((r: { runNumber: number; value: number }) => r.runNumber === i + 1)
                    return (
                      <td key={i} className="p-3 text-center font-mono">
                        {run ? `${run.value}` : '-'}
                      </td>
                    )
                  })}
                  <td className="p-3 text-center font-mono font-semibold">
                    {player.average}{session.unit}
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-green-600">
                    {player.best}{session.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>検索条件に一致する選手が見つかりません</p>
          </div>
        )}
      </Card>

      {session.notes && (
        <Card className="p-4">
          <div className="text-sm"><strong>メモ:</strong> {session.notes}</div>
        </Card>
      )}
    </div>
  )
}
