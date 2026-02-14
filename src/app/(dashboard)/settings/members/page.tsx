'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, User, Loader2, UserPlus, Plus, Pencil, X, Save } from 'lucide-react'
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
  height_cm: number | null
  weight_kg: number | null
  date_of_birth: string | null
}

interface EditForm {
  display_name: string
  player_name: string
  jersey_number: string
  position: string
  role: string
  height_cm: string
  weight_kg: string
  date_of_birth: string
}

const ROLES = [
  { value: 'admin', label: '管理者', description: '全機能アクセス可能', variant: 'default' as const },
  { value: 'player', label: '選手', description: '自分のデータ閲覧・入力', variant: 'secondary' as const },
  { value: 'viewer', label: '閲覧者', description: 'データ閲覧のみ', variant: 'outline' as const },
]

const POSITIONS = [
  { value: '', label: '未設定' },
  { value: 'PG', label: 'PG（ポイントガード）' },
  { value: 'SG', label: 'SG（シューティングガード）' },
  { value: 'SF', label: 'SF（スモールフォワード）' },
  { value: 'PF', label: 'PF（パワーフォワード）' },
  { value: 'C', label: 'C（センター）' },
]

function memberToEditForm(m: Member): EditForm {
  return {
    display_name: m.display_name || '',
    player_name: m.player_name || '',
    jersey_number: m.jersey_number != null ? String(m.jersey_number) : '',
    position: m.position || '',
    role: m.role,
    height_cm: m.height_cm != null ? String(m.height_cm) : '',
    weight_kg: m.weight_kg != null ? String(m.weight_kg) : '',
    date_of_birth: m.date_of_birth || '',
  }
}

export default function MembersSettingsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
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

  const startEditing = (member: Member) => {
    setEditingId(member.id)
    setEditForm(memberToEditForm(member))
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleSave = async (profileId: string) => {
    if (!editForm) return
    setSavingId(profileId)
    try {
      const payload: Record<string, unknown> = { profileId }

      const member = members.find(m => m.id === profileId)
      if (!member) return

      // Only send changed fields
      if (editForm.display_name !== (member.display_name || ''))
        payload.display_name = editForm.display_name
      if (editForm.player_name !== (member.player_name || ''))
        payload.player_name = editForm.player_name || null
      if (editForm.jersey_number !== (member.jersey_number != null ? String(member.jersey_number) : ''))
        payload.jersey_number = editForm.jersey_number ? parseInt(editForm.jersey_number) : null
      if (editForm.position !== (member.position || ''))
        payload.position = editForm.position || null
      if (editForm.role !== member.role)
        payload.role = editForm.role
      if (editForm.height_cm !== (member.height_cm != null ? String(member.height_cm) : ''))
        payload.height_cm = editForm.height_cm ? parseFloat(editForm.height_cm) : null
      if (editForm.weight_kg !== (member.weight_kg != null ? String(member.weight_kg) : ''))
        payload.weight_kg = editForm.weight_kg ? parseFloat(editForm.weight_kg) : null
      if (editForm.date_of_birth !== (member.date_of_birth || ''))
        payload.date_of_birth = editForm.date_of_birth || null

      // Check if anything changed
      if (Object.keys(payload).length <= 1) {
        cancelEditing()
        return
      }

      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || '更新に失敗しました')
        return
      }
      const { member: updated } = await res.json()
      setMembers(prev => prev.map(m => m.id === profileId ? { ...m, ...updated } : m))
      cancelEditing()
      toast.success('メンバー情報を更新しました')
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
            チームメンバーの情報と役割を管理します
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
          <CardDescription>メンバーの「編集」をクリックして情報を変更できます</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">メンバーが登録されていません</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const roleBadge = getRoleBadge(member.role)
                const isEditing = editingId === member.id
                const isSaving = savingId === member.id

                if (isEditing && editForm) {
                  return (
                    <div key={member.id} className="p-4 rounded-lg border border-primary/30 bg-muted/30">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold text-sm">メンバー情報を編集</p>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSave(member.id)} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
                            保存
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={isSaving}>
                            <X className="mr-1 h-3 w-3" />
                            キャンセル
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">表示名</Label>
                          <Input
                            value={editForm.display_name}
                            onChange={e => setEditForm(f => f ? { ...f, display_name: e.target.value } : f)}
                            placeholder="表示名"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">選手名</Label>
                          <Input
                            value={editForm.player_name}
                            onChange={e => setEditForm(f => f ? { ...f, player_name: e.target.value } : f)}
                            placeholder="選手名"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">背番号</Label>
                          <Input
                            type="number"
                            value={editForm.jersey_number}
                            onChange={e => setEditForm(f => f ? { ...f, jersey_number: e.target.value } : f)}
                            placeholder="背番号"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">ポジション</Label>
                          <select
                            value={editForm.position}
                            onChange={e => setEditForm(f => f ? { ...f, position: e.target.value } : f)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            {POSITIONS.map(p => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">ロール</Label>
                          <select
                            value={editForm.role}
                            onChange={e => setEditForm(f => f ? { ...f, role: e.target.value } : f)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            {ROLES.map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">身長 (cm)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editForm.height_cm}
                            onChange={e => setEditForm(f => f ? { ...f, height_cm: e.target.value } : f)}
                            placeholder="例: 175.5"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">体重 (kg)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editForm.weight_kg}
                            onChange={e => setEditForm(f => f ? { ...f, weight_kg: e.target.value } : f)}
                            placeholder="例: 68.0"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">生年月日</Label>
                          <Input
                            type="date"
                            value={editForm.date_of_birth}
                            onChange={e => setEditForm(f => f ? { ...f, date_of_birth: e.target.value } : f)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">Email: {member.email}</p>
                    </div>
                  )
                }

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
                          <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                          {member.jersey_number != null && (
                            <Badge variant="outline">#{member.jersey_number}</Badge>
                          )}
                          {member.position && (
                            <span className="text-xs text-muted-foreground">{member.position}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => startEditing(member)}>
                      <Pencil className="mr-1 h-3 w-3" />
                      編集
                    </Button>
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
