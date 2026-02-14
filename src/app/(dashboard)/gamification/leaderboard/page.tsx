'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Trophy, Medal, User, Loader2 } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  jerseyNumber: number | null
  position: string | null
  sessionCount: number
  runCount: number
  average: number | null
  personalBest: number | null
  badgeCount: number
  score: number
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/players')
        const json = await res.json()
        const players = json.players || []

        const entries: LeaderboardEntry[] = players.map((p: Record<string, unknown>, i: number) => {
          const sessionCount = (p.sessionCount as number) || 0
          const runCount = (p.runCount as number) || 0
          const badgeCount = (p.badgeCount as number) || 0
          const score = sessionCount * 50 + runCount * 10 + badgeCount * 100
          return {
            rank: i + 1,
            id: p.id as string,
            name: p.name as string,
            jerseyNumber: p.jerseyNumber as number | null,
            position: p.position as string | null,
            sessionCount,
            runCount,
            average: p.average as number | null,
            personalBest: p.personalBest as number | null,
            badgeCount,
            score,
          }
        })

        entries.sort((a, b) => b.score - a.score)
        entries.forEach((e, i) => (e.rank = i + 1))

        setData(entries)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />
    return <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">リーダーボード</h1>
          <p className="text-muted-foreground mt-2">チーム内のパフォーマンスランキング</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            まだデータがありません。セッションを記録するとランキングが表示されます。
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">リーダーボード</h1>
        <p className="text-muted-foreground mt-2">
          チーム内のパフォーマンスランキング
        </p>
      </div>

      {/* Top 3 */}
      {data.length >= 3 && (
        <div className="grid gap-4 md:grid-cols-3">
          {data.slice(0, 3).map((player, index) => (
            <Card
              key={player.id}
              className={`${
                index === 0 ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' :
                index === 1 ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50' :
                'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRankBadge(player.rank)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2">
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{player.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {player.jerseyNumber != null && (
                        <Badge variant="outline" className="text-xs">#{player.jerseyNumber}</Badge>
                      )}
                      {player.position && <span>{player.position}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">スコア</span>
                  <span className="text-xl font-bold">{player.score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">セッション数</span>
                  <span className="text-lg font-semibold">{player.sessionCount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full ranking */}
      <Card>
        <CardHeader>
          <CardTitle>全体ランキング</CardTitle>
          <CardDescription>チーム内の総合スコアランキング</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors ${
                  player.rank <= 3 ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 flex items-center justify-center">
                    {getRankBadge(player.rank)}
                  </div>
                  <Avatar className="h-10 w-10 border">
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{player.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {player.jerseyNumber != null && (
                        <Badge variant="outline" className="text-xs">#{player.jerseyNumber}</Badge>
                      )}
                      {player.position && <span>{player.position}</span>}
                      <span>•</span>
                      <span>{player.sessionCount} セッション</span>
                    </div>
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-2xl font-bold">{player.score.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">ポイント</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">スコアについて</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            リーダーボードのスコアは以下の要素から計算されます：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>セッション参加数 × 50pt</li>
            <li>ラン記録数 × 10pt</li>
            <li>獲得バッジ数 × 100pt</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
