'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, User, Loader2, UserPlus, Plus, Pencil, X, Save, KeyRound, Users } from 'lucide-react'
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

const ROLES = [
  { value: 'admin', label: '管理者', variant: 'default' as const },
  { value: 'player', label: '選手', variant: 'secondary' as const },
  { value: 'viewer', label: '閲覧者', variant: 'outline' as const },
]

const POSITIONS = [
  { value: '', label: '未設定' },
  { value: 'PG', label: 'PG（ポイントガード）' },
  { value: 'SG', label: 'SG（シューティングガード）' },
  { value: 'SF', label: 'SF（スモールフォワード）' },
  { value: 'PF', label: 'PF（パワーフォワード）' },
  { value: 'C', label: 'C（センター）' },
]

export default function MembersSettingsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newPlayer, setNewPlayer] = useState({ playerName: '', jerseyNumber: '', position: '' })

  // Account edit form
  const [accountEdit, setAccountEdit] = useState<{ display_name: string; role: string } | null>(null)
  // Player edit form
  const [playerEdit, setPlayerEdit] = useState<{
    player_name: string; jersey_number: string; position: string
    height_cm: string; weight_kg: string; date_of_birth: string
  } | null>(null)

  useEffect(() => {
    fetch('/api/admin/members')
      .then(res => res.json())
      .then(d => { setMembers(d.members || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cancelEditing = () => {
    setEditingId(null)
    setAccountEdit(null)
    setPlayerEdit(null)
  }

  const handleSaveAccount = async (profileId: string) => {
    if (!accountEdit) return
    const member = members.find(m => m.id === profileId)
    if (!member) return
    setSavingId(profileId)
    try {
      const payload: Record<string, unknown> = { profileId }
      if (accountEdit.display_name !== (member.display_name || ''))
        payload.display_name = accountEdit.display_name
      if (accountEdit.role !== member.role)
        payload.role = accountEdit.role
      if (Object.keys(payload).length <= 1) { cancelEditing(); return }

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
      toast.success('アカウント情報を更新しました')
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setSavingId(null)
    }
  }

  const handleSavePlayer = async (profileId: string) => {
    if (!playerEdit) return
    const member = members.find(m => m.id === profileId)
    if (!member) return
    setSavingId(profileId)
    try {
      const payload: Record<string, unknown> = { profileId }
      if (playerEdit.player_name !== (member.player_name || ''))
        payload.player_name = playerEdit.player_name || null
      if (playerEdit.jersey_number !== (member.jersey_number != null ? String(member.jersey_number) : ''))
        payload.jersey_number = playerEdit.jersey_number ? parseInt(playerEdit.jersey_number) : null
      if (playerEdit.position !== (member.position || ''))
        payload.position = playerEdit.position || null
      if (playerEdit.height_cm !== (member.height_cm != null ? String(member.height_cm) : ''))
        payload.height_cm = playerEdit.height_cm ? parseFloat(playerEdit.height_cm) : null
      if (playerEdit.weight_kg !== (member.weight_kg != null ? String(member.weight_kg) : ''))
        payload.weight_kg = playerEdit.weight_kg ? parseFloat(playerEdit.weight_kg) : null
      if (playerEdit.date_of_birth !== (member.date_of_birth || ''))
        payload.date_of_birth = playerEdit.date_of_birth || null
      if (Object.keys(payload).length <= 1) { cancelEditing(); return }

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
      toast.success('選手情報を更新しました')
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
    return ROLES.find(r => r.value === role) || { label: role, variant: 'outline' as const }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const accounts = members
  const players = members.filter(m => m.role === 'player' || m.player_name)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">メンバー管理</h1>
          <p className="text-muted-foreground mt-1">
            アカウント情報と選手情報を管理します
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理者</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.filter(m => m.role === 'admin').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">選手</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.filter(m => m.role === 'player').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">閲覧者</CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.filter(m => m.role === 'viewer').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts" className="gap-2">
            <KeyRound className="h-4 w-4" />
            アカウント管理
          </TabsTrigger>
          <TabsTrigger value="players" className="gap-2">
            <Users className="h-4 w-4" />
            選手管理
          </TabsTrigger>
        </TabsList>

        {/* ===== アカウント管理タブ ===== */}
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>アカウント一覧</CardTitle>
              <CardDescription>ログインアカウントの表示名とロール（権限）を管理します</CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">アカウントが登録されていません</p>
              ) : (
                <div className="space-y-2">
                  {accounts.map((member) => {
                    const roleBadge = getRoleBadge(member.role)
                    const isEditing = editingId === member.id && accountEdit !== null
                    const isSaving = savingId === member.id

                    if (isEditing && accountEdit) {
                      return (
                        <div key={member.id} className="p-4 rounded-lg border border-primary/30 bg-muted/30">
                          <div className="flex items-center justify-between mb-4">
                            <p className="font-semibold text-sm">アカウント情報を編集</p>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveAccount(member.id)} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
                                保存
                              </Button>
                              <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={isSaving}>
                                <X className="mr-1 h-3 w-3" />
                                キャンセル
                              </Button>
                            </div>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">メールアドレス</Label>
                              <Input value={member.email} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">表示名</Label>
                              <Input
                                value={accountEdit.display_name}
                                onChange={e => setAccountEdit(f => f ? { ...f, display_name: e.target.value } : f)}
                                placeholder="表示名"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">ロール</Label>
                              <select
                                value={accountEdit.role}
                                onChange={e => setAccountEdit(f => f ? { ...f, role: e.target.value } : f)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                {ROLES.map(r => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border">
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              <KeyRound className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.display_name || member.email}</p>
                              <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            cancelEditing()
                            setEditingId(member.id)
                            setAccountEdit({ display_name: member.display_name || '', role: member.role })
                          }}
                        >
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

          <Card className="border-orange-200 bg-orange-50 mt-4">
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
        </TabsContent>

        {/* ===== 選手管理タブ ===== */}
        <TabsContent value="players">
          {/* Add Player */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    選手登録
                  </CardTitle>
                  <CardDescription>新しい選手をチームに追加します（アカウント未紐付けの選手データ）</CardDescription>
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

          {/* Player List */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>選手一覧</CardTitle>
              <CardDescription>選手名・背番号・ポジション・身体情報を管理します</CardDescription>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">選手が登録されていません</p>
              ) : (
                <div className="space-y-3">
                  {players.map((member) => {
                    const isEditing = editingId === member.id && playerEdit !== null
                    const isSaving = savingId === member.id

                    if (isEditing && playerEdit) {
                      return (
                        <div key={member.id} className="p-4 rounded-lg border border-primary/30 bg-muted/30">
                          <div className="flex items-center justify-between mb-4">
                            <p className="font-semibold text-sm">選手情報を編集</p>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSavePlayer(member.id)} disabled={isSaving}>
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
                              <Label className="text-xs">選手名</Label>
                              <Input
                                value={playerEdit.player_name}
                                onChange={e => setPlayerEdit(f => f ? { ...f, player_name: e.target.value } : f)}
                                placeholder="選手名"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">背番号</Label>
                              <Input
                                type="number"
                                value={playerEdit.jersey_number}
                                onChange={e => setPlayerEdit(f => f ? { ...f, jersey_number: e.target.value } : f)}
                                placeholder="背番号"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">ポジション</Label>
                              <select
                                value={playerEdit.position}
                                onChange={e => setPlayerEdit(f => f ? { ...f, position: e.target.value } : f)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                {POSITIONS.map(p => (
                                  <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">身長 (cm)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={playerEdit.height_cm}
                                onChange={e => setPlayerEdit(f => f ? { ...f, height_cm: e.target.value } : f)}
                                placeholder="例: 175.5"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">体重 (kg)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={playerEdit.weight_kg}
                                onChange={e => setPlayerEdit(f => f ? { ...f, weight_kg: e.target.value } : f)}
                                placeholder="例: 68.0"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">生年月日</Label>
                              <Input
                                type="date"
                                value={playerEdit.date_of_birth}
                                onChange={e => setPlayerEdit(f => f ? { ...f, date_of_birth: e.target.value } : f)}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            紐付きアカウント: {member.display_name || '未紐付け'} ({member.email})
                          </p>
                        </div>
                      )
                    }

                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border">
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.player_name || '（未設定）'}</p>
                              {member.jersey_number != null && (
                                <Badge variant="outline">#{member.jersey_number}</Badge>
                              )}
                              {member.position && (
                                <Badge variant="secondary">{member.position}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              アカウント: {member.display_name || member.email}
                              {member.height_cm ? ` / ${member.height_cm}cm` : ''}
                              {member.weight_kg ? ` / ${member.weight_kg}kg` : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            cancelEditing()
                            setEditingId(member.id)
                            setPlayerEdit({
                              player_name: member.player_name || '',
                              jersey_number: member.jersey_number != null ? String(member.jersey_number) : '',
                              position: member.position || '',
                              height_cm: member.height_cm != null ? String(member.height_cm) : '',
                              weight_kg: member.weight_kg != null ? String(member.weight_kg) : '',
                              date_of_birth: member.date_of_birth || '',
                            })
                          }}
                        >
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
