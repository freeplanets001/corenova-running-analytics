'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Save, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Session { id: string; date: string; testType: string }
interface Player { id: string; name: string }

export default function BulkEntryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState('')
  const [grid, setGrid] = useState<Map<string, string[]>>(new Map())
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const runCount = 5

  useEffect(() => {
    Promise.all([
      fetch('/api/sessions').then(r => r.json()),
      fetch('/api/players').then(r => r.json()),
    ]).then(([sData, pData]) => {
      const pList: Player[] = pData.players || []
      setSessions(sData.sessions?.map((s: { id: string; date: string; testType: string }) => ({
        id: s.id, date: s.date, testType: s.testType,
      })) || [])
      setPlayers(pList)
      const g = new Map<string, string[]>()
      pList.forEach(p => g.set(p.id, Array(runCount).fill('')))
      setGrid(g)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const updateCell = (playerId: string, runIdx: number, value: string) => {
    setGrid(prev => {
      const next = new Map(prev)
      const runs = [...(next.get(playerId) || Array(runCount).fill(''))]
      runs[runIdx] = value
      next.set(playerId, runs)
      return next
    })
  }

  const getAvg = (playerId: string) => {
    const runs = grid.get(playerId) || []
    const valid = runs.filter(r => r && !isNaN(parseFloat(r))).map(r => parseFloat(r))
    return valid.length > 0 ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : null
  }

  const handleSubmit = async () => {
    if (!selectedSession) return
    setSubmitting(true)
    setMessage(null)

    let saved = 0
    for (const [playerId, runs] of grid.entries()) {
      const valid = runs
        .map((r, i) => ({ runNumber: i + 1, value: parseFloat(r) }))
        .filter(r => !isNaN(r.value))
      if (valid.length === 0) continue

      try {
        const res = await fetch(`/api/sessions/${selectedSession}/runs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId, runs: valid }),
        })
        if (res.ok) saved++
      } catch { /* skip failed */ }
    }

    setMessage(`${saved}名のデータを保存しました`)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            一括入力
            <Badge>Admin</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">複数選手のデータをまとめて入力</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" /> セッション選択
            </CardTitle>
            <Button onClick={handleSubmit} disabled={submitting || !selectedSession}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              一括保存
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm mb-4"
            value={selectedSession}
            onChange={e => setSelectedSession(e.target.value)}
          >
            <option value="">セッションを選択...</option>
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {new Date(s.date).toLocaleDateString('ja-JP')} - {s.testType}
              </option>
            ))}
          </select>

          {message && (
            <p className={`text-sm mb-4 ${message.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold sticky left-0 bg-background min-w-[120px]">選手名</th>
                  {Array.from({ length: runCount }, (_, i) => (
                    <th key={i} className="text-center p-2 font-semibold min-w-[80px]">{i + 1}本目</th>
                  ))}
                  <th className="text-center p-2 font-semibold min-w-[80px] bg-blue-50">平均</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  const avg = getAvg(player.id)
                  return (
                    <tr key={player.id} className="border-b">
                      <td className="p-2 font-medium sticky left-0 bg-background">{player.name}</td>
                      {Array.from({ length: runCount }, (_, i) => (
                        <td key={i} className="p-1">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="-"
                            value={grid.get(player.id)?.[i] || ''}
                            onChange={e => updateCell(player.id, i, e.target.value)}
                            className="text-center font-mono h-8 w-20"
                          />
                        </td>
                      ))}
                      <td className="p-2 text-center font-mono font-bold bg-blue-50">
                        {avg !== null ? avg : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
