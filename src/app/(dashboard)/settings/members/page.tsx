'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, User, Loader2, Check, UserPlus, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Member {
  id: string
  email: string
  display_name: string
  player_name: string | null
  jersey_number: number | null
  position: string | null
  role: 'admin' | 'player' | 'viewer'
  is_active: boolean
  created_at: string
}

const ROLES = [
  { value: 'admin', label: '管理者', description: '全機能アクセス可能', variant: 'default' as const },
  { value: 'player', label: '選手', description: '自分のデータ閲覧・入力', variant: 'secondary' as const },
  { value: 'viewer', label: '閲覧者', description: 'データ閲覧のみ', variant: 'outline' as const },
]

export default function MembersSettingsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newPlayer, setNewPlayer] = useState({ playerName: '', jerseyNumber: '', position: '' })

  useEffect(() => {
    fetch('/api/admin/members')
      .then(res => res.json())
      .then(d => { setMembers(d.members || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleRoleChange = async (profileId: string, newRole: string) => {
    setSavingId(profileId)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, role: newRole }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'ロール変更に失敗しました')
        return
      }
      setMembers(prev => prev.map(m => m.id === profileId ? { ...m, role: newRole as Member['role'] } : m))
      setEditingId(null)
      toast.success('ロールを変更しました')
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setSavingId(null)
    }
  }

  const handleAddPlayer = async () => {
    if (!newPlayer.playerName.trim()) {
      toast.error('選手名を入力してください')
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || '選手の追加に失敗しました')
        return
      }
      const { member } = await res.json()
      setMembers(prev => [...prev, member])
      setNewPlayer({ playerName: '', jerseyNumber: '', position: '' })
      setShowAddForm(false)
      toast.success(`${member.player_name} を追加しました`)
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setAdding(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const r = ROLES.find(r => r.value === role)
    return r || { label: role, variant: 'outline' as const }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const adminCount = members.filter(m => m.role === 'admin').length
  const playerCount = members.filter(m => m.role === 'player').length
  const viewerCount = members.filter(m => m.role === 'viewer').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">メンバー管理</h1>
          <p className="text-muted-foreground mt-1">
            チームメンバーの役割（ロール）を管理します
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理者</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">選手</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">閲覧者</CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewerCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Player */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                選手登録
              </CardTitle>
              <CardDescription>新しい選手をチームに追加します</CardDescription>
            </div>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                選手を追加
              </Button>
            )}
          </div>
        </CardHeader>
        {showAddForm && (
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="playerName">選手名 *</Label>
                <Input
                  id="playerName"
                  placeholder="例: 山田 太郎"
                  value={newPlayer.playerName}
                  onChange={e => setNewPlayer(p => ({ ...p, playerName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jerseyNumber">背番号</Label>
                <Input
                  id="jerseyNumber"
                  type="number"
                  placeholder="例: 23"
                  value={newPlayer.jerseyNumber}
                  onChange={e => setNewPlayer(p => ({ ...p, jerseyNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">ポジション</Label>
                <select
                  id="position"
                  value={newPlayer.position}
                  onChange={e => setNewPlayer(p => ({ ...p, position: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  <option value="PG">PG（ポイントガード）</option>
                  <option value="SG">SG（シューティングガード）</option>
                  <option value="SF">SF（スモールフォワード）</option>
                  <option value="PF">PF（パワーフォワード）</option>
                  <option value="C">C（センター）</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddPlayer} disabled={adding}>
                {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                登録
              </Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setNewPlayer({ playerName: '', jerseyNumber: '', position: '' }) }} disabled={adding}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>メンバー一覧</CardTitle>
          <CardDescription>メンバーの「編集」をクリックしてロールを変更できます</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">メンバーが登録されていません</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const roleBadge = getRoleBadge(member.role)
                const isEditing = editingId === member.id
                const isSaving = savingId === member.id

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border">
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {member.player_name || member.display_name || member.email}
                          </p>
                          {!isEditing && (
                            <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                          )}
                          {member.jersey_number && (
                            <Badge variant="outline">#{member.jersey_number}</Badge>
                          )}
                          {member.position && (
                            <span className="text-xs text-muted-foreground">{member.position}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          {ROLES.map(r => (
                            <Button
                              key={r.value}
                              variant={member.role === r.value ? 'default' : 'outline'}
                              size="sm"
                              disabled={isSaving}
                              onClick={() => handleRoleChange(member.id, r.value)}
                            >
                              {isSaving && member.role !== r.value ? null : (
                                member.role === r.value && <Check className="mr-1 h-3 w-3" />
                              )}
                              {r.label}
                            </Button>
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} disabled={isSaving}>
                            キャンセル
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setEditingId(member.id)}>
                          編集
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold">権限について</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong>管理者:</strong> すべての機能にアクセス可能（セッション作成・データ管理・メンバー管理・AI機能）</li>
                <li><strong>選手:</strong> 自分のデータ閲覧・入力、個人目標の管理が可能</li>
                <li><strong>閲覧者:</strong> チームデータの閲覧のみ可能</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
