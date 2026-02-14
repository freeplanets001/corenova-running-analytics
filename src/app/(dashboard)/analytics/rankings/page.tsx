'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Loader2, Activity } from 'lucide-react'
import Link from 'next/link'

interface TopPlayer {
  playerId: string
  playerName: string
  average: number
  runCount: number
  rank: number
}

export default function RankingsPage() {
  const [players, setPlayers] = useState<TopPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/team')
      .then(res => res.json())
      .then(d => { setPlayers(d.topPlayers || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!players.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="mb-2 h-10 w-10 opacity-30" />
        <p>データがありません</p>
      </div>
    )
  }

  const bySpeed = [...players].sort((a, b) => a.average - b.average)
  const byRunCount = [...players].sort((a, b) => b.runCount - a.runCount)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          ランキング
        </h1>
        <p className="text-muted-foreground mt-2">{players.length}名の選手ランキング</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Speed Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">平均タイム順（速い順）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bySpeed.map((player, idx) => (
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
                  <span className="font-bold font-mono">{player.average}秒</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Run Count Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">計測本数順</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byRunCount.map((player, idx) => (
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
                  <span className="font-bold">{player.runCount}本</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
