'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, CalendarPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NewSessionPage() {
  const router = useRouter()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, location, notes }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      router.push(`/sessions/${data.id}`)
    } catch {
      setError('セッションの作成に失敗しました')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新規セッション</h1>
          <p className="text-muted-foreground mt-1">測定セッションを作成します</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            セッション情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">測定日</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">場所（任意）</Label>
              <Input
                id="location"
                placeholder="例: メインコート"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">メモ（任意）</Label>
              <Input
                id="notes"
                placeholder="例: 雨天のため室内で実施"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                セッションを作成
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
