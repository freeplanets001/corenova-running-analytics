'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Users, Calendar, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function TeamSettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [teamId, setTeamId] = useState('')
  const [form, setForm] = useState({ name: '', description: '' })
  const [stats, setStats] = useState({ members: 0, sessions: 0, admins: 0 })

  useEffect(() => {
    const fetchTeam = async () => {
      const { data: teams } = await supabase.from('teams').select('id, name, description').limit(1)
      if (teams?.[0]) {
        setTeamId(teams[0].id)
        setForm({ name: teams[0].name || '', description: teams[0].description || '' })
      }

      // Fetch stats
      const { count: memberCount } = await supabase.from('team_members').select('id', { count: 'exact', head: true })
      const { count: sessionCount } = await supabase.from('sessions').select('id', { count: 'exact', head: true })
      const { count: adminCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin')

      setStats({
        members: memberCount || 0,
        sessions: sessionCount || 0,
        admins: adminCount || 0,
      })
      setLoading(false)
    }

    fetchTeam()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamId) return

    setSaving(true)
    const { error } = await supabase
      .from('teams')
      .update({ name: form.name, description: form.description })
      .eq('id', teamId)

    setSaving(false)
    if (error) {
      toast.error('チーム情報の更新に失敗しました')
      return
    }
    toast.success('チーム情報を更新しました')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">チーム設定</h1>
          <p className="text-muted-foreground mt-1">
            チームの基本情報を管理します（管理者のみ）
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>チーム情報</CardTitle>
          <CardDescription>チームの基本情報を編集します</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamName">チーム名</Label>
              <Input
                id="teamName"
                type="text"
                placeholder="チーム名を入力"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">チーム説明</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="チームの説明や目標を入力してください"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              変更を保存
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>チーム統計</CardTitle>
          <CardDescription>現在のチーム状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.members}</p>
                <p className="text-sm text-muted-foreground">メンバー</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.sessions}</p>
                <p className="text-sm text-muted-foreground">セッション数</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <Shield className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">管理者</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
