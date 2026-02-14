'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Users, MapPin, Loader2, Lock, Activity } from 'lucide-react'
import Link from 'next/link'

interface Session {
  id: string
  date: string
  testType: string
  unit: string
  playerCount: number
  teamAverage: number
  location?: string
  isLocked: boolean
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions || [])
        setLoading(false)
      })
      .catch(() => {
        setError('データの取得に失敗しました')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="mb-2 h-10 w-10 opacity-30" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">セッション一覧</h1>
          <p className="text-muted-foreground mt-2">
            全{sessions.length}回の測定セッション
          </p>
        </div>
        <Link href="/sessions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規セッション
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Link key={session.id} href={`/sessions/${session.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {session.testType}
                      {session.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.date).toLocaleDateString('ja-JP')}
                      </span>
                      {session.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {session.location}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={session.isLocked ? 'secondary' : 'outline'}>
                    {session.isLocked ? 'ロック済み' : '編集可能'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {session.playerCount}名参加
                  </span>
                  <span className="font-semibold text-foreground">
                    チーム平均: {session.teamAverage}{session.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">セッションがありません</p>
            <p className="text-sm text-muted-foreground mt-1">
              「新規セッション」ボタンから最初のセッションを作成しましょう
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
