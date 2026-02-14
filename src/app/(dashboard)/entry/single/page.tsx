'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Plus, Minus, Save, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Session { id: string; date: string; testType: string }
interface Player { id: string; name: string }

export default function SingleEntryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [runs, setRuns] = useState<string[]>(['', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/sessions').then(r => r.json()),
      fetch('/api/players').then(r => r.json()),
    ]).then(([sData, pData]) => {
      setSessions(sData.sessions?.map((s: { id: string; date: string; testType: string }) => ({
        id: s.id,
        date: s.date,
        testType: s.testType,
      })) || [])
      setPlayers(pData.players || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const addRun = () => setRuns(prev => [...prev, ''])
  const removeRun = () => { if (runs.length > 1) setRuns(prev => prev.slice(0, -1)) }
  const updateRun = (idx: number, val: string) => {
    setRuns(prev => prev.map((r, i) => i === idx ? val : r))
  }

  const validRuns = runs.filter(r => r && !isNaN(parseFloat(r)))
  const avg = validRuns.length > 0
    ? Math.round((validRuns.reduce((s, r) => s + parseFloat(r), 0) / validRuns.length) * 10) / 10
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSession || !selectedPlayer || validRuns.length === 0) return
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/sessions/${selectedSession}/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayer,
          runs: validRuns.map((r, i) => ({ runNumber: i + 1, value: parseFloat(r) })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setMessage('データを保存しました')
      setRuns(['', '', ''])
    } catch {
      setMessage('保存に失敗しました')
    }
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
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">個人入力</h1>
          <p className="text-muted-foreground mt-1">1名分のデータを入力します</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5" /> データ入力
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>セッション</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={selectedSession}
                onChange={e => setSelectedSession(e.target.value)}
                required
              >
                <option value="">セッションを選択...</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.date).toLocaleDateString('ja-JP')} - {s.testType}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>選手</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={selectedPlayer}
                onChange={e => setSelectedPlayer(e.target.value)}
                required
              >
                <option value="">選手を選択...</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>計測データ</Label>
                <div className="flex gap-1">
                  <Button type="button" variant="outline" size="sm" onClick={removeRun} disabled={runs.length <= 1}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addRun} disabled={runs.length >= 12}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                {runs.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-16">{i + 1}本目</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="秒"
                      value={r}
                      onChange={e => updateRun(i, e.target.value)}
                      className="text-lg font-mono"
                    />
                  </div>
                ))}
              </div>
              {avg > 0 && (
                <p className="text-sm text-muted-foreground">
                  平均: <span className="font-bold text-foreground">{avg}秒</span>
                </p>
              )}
            </div>

            {message && (
              <p className={`text-sm ${message.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting || !selectedSession || !selectedPlayer || validRuns.length === 0}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              保存
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
