'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Activity, X, UserPlus } from 'lucide-react'

interface Player {
  id: string
  name: string
}

interface PlayerDetail {
  playerId: string
  playerName: string
  overallAverage: number
  personalBest: number
  personalWorst: number
  improvement: number
  sessionCount: number
  totalRuns: number
}

const COLORS = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-pink-600']

export default function ComparisonPage() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [playerDetails, setPlayerDetails] = useState<Map<string, PlayerDetail>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(d => { setAllPlayers(d.players || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const addPlayer = (id: string) => {
    if (selectedIds.includes(id) || selectedIds.length >= 5) return
    setSelectedIds(prev => [...prev, id])
    if (!playerDetails.has(id)) {
      fetch(`/api/analytics/player/${id}`)
        .then(res => res.json())
        .then((data: PlayerDetail) => {
          setPlayerDetails(prev => new Map(prev).set(id, data))
        })
    }
  }

  const removePlayer = (id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const availablePlayers = allPlayers.filter(p => !selectedIds.includes(p.id))
  const selected = selectedIds.map(id => playerDetails.get(id)).filter(Boolean) as PlayerDetail[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">選手比較</h1>
        <p className="text-muted-foreground mt-2">最大5名まで選択して比較できます</p>
      </div>

      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            選手を選択 ({selectedIds.length}/5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedIds.map((id, idx) => {
              const p = allPlayers.find(x => x.id === id)
              return (
                <Badge key={id} variant="secondary" className={`gap-1 ${COLORS[idx]}`}>
                  {p?.name || '...'}
                  <button onClick={() => removePlayer(id)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {availablePlayers.map(p => (
              <Button key={p.id} variant="outline" size="sm" onClick={() => addPlayer(p.id)} disabled={selectedIds.length >= 5}>
                {p.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selected.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">統計比較</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">指標</th>
                    {selected.map((p, idx) => (
                      <th key={p.playerId} className={`text-center p-3 font-semibold ${COLORS[idx]}`}>
                        {p.playerName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">全体平均</td>
                    {selected.map(p => (
                      <td key={p.playerId} className="p-3 text-center font-mono font-bold">{p.overallAverage}秒</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">自己ベスト</td>
                    {selected.map(p => (
                      <td key={p.playerId} className="p-3 text-center font-mono">{p.personalBest}秒</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">ワースト</td>
                    {selected.map(p => (
                      <td key={p.playerId} className="p-3 text-center font-mono">{p.personalWorst}秒</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">改善度</td>
                    {selected.map(p => (
                      <td key={p.playerId} className={`p-3 text-center font-mono ${p.improvement > 0 ? 'text-green-600' : p.improvement < 0 ? 'text-red-600' : ''}`}>
                        {p.improvement > 0 ? '+' : ''}{p.improvement}秒
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">参加セッション</td>
                    {selected.map(p => (
                      <td key={p.playerId} className="p-3 text-center">{p.sessionCount}回</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-muted-foreground">合計本数</td>
                    {selected.map(p => (
                      <td key={p.playerId} className="p-3 text-center">{p.totalRuns}本</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selected.length < 2 && selectedIds.length > 0 && (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            {selectedIds.length === 1 ? 'もう1名以上選択してください' : 'データを読み込み中...'}
          </p>
        </Card>
      )}

      {selectedIds.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">選手を選択してください</p>
            <p className="text-sm mt-1">上のボタンから2名以上の選手を選択すると比較表が表示されます</p>
          </div>
        </Card>
      )}
    </div>
  )
}
