'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Shield, Plus, TrendingUp, TrendingDown, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface TestType {
  id: string
  name: string
  unit: string
  direction: string
  min_value: number | null
  max_value: number | null
  is_active: boolean
}

export default function TestTypesSettingsPage() {
  const supabase = createClient()
  const [testTypes, setTestTypes] = useState<TestType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newType, setNewType] = useState({ name: '', unit: '秒', direction: 'decrease', min_value: '', max_value: '' })

  const fetchTestTypes = async () => {
    const { data: teams } = await supabase.from('teams').select('id').limit(1)
    const teamId = teams?.[0]?.id
    if (!teamId) { setLoading(false); return }

    const { data } = await supabase
      .from('test_types')
      .select('id, name, unit, direction, min_value, max_value, is_active')
      .eq('team_id', teamId)
      .order('sort_order')

    setTestTypes(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchTestTypes() }, [supabase])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newType.name.trim()) return

    setSaving(true)
    const { data: teams } = await supabase.from('teams').select('id').limit(1)
    const teamId = teams?.[0]?.id
    if (!teamId) { setSaving(false); return }

    const { error } = await supabase.from('test_types').insert({
      team_id: teamId,
      name: newType.name.trim(),
      unit: newType.unit,
      direction: newType.direction,
      min_value: newType.min_value ? Number(newType.min_value) : null,
      max_value: newType.max_value ? Number(newType.max_value) : null,
      sort_order: testTypes.length,
    })

    setSaving(false)
    if (error) {
      toast.error('テストタイプの追加に失敗しました')
      return
    }
    toast.success('テストタイプを追加しました')
    setNewType({ name: '', unit: '秒', direction: 'decrease', min_value: '', max_value: '' })
    fetchTestTypes()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('test_types').delete().eq('id', id)
    if (error) {
      toast.error('削除に失敗しました')
      return
    }
    toast.success('テストタイプを削除しました')
    setTestTypes(prev => prev.filter(t => t.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">テストタイプ管理</h1>
          <p className="text-muted-foreground mt-1">
            測定項目とその設定を管理します（管理者のみ）
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">登録済みテストタイプ</h2>
        <p className="text-sm text-muted-foreground mt-1">全{testTypes.length}件</p>
      </div>

      {testTypes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            テストタイプがまだ登録されていません
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testTypes.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      {!test.is_active && <Badge variant="secondary">無効</Badge>}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span>単位: {test.unit}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {test.direction === 'increase' ? (
                          <><TrendingUp className="h-4 w-4 text-green-600" />高い方が良い</>
                        ) : (
                          <><TrendingDown className="h-4 w-4 text-blue-600" />低い方が良い</>
                        )}
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(test.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {(test.min_value != null || test.max_value != null) && (
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">最小値</p>
                      <p className="font-medium">{test.min_value ?? '-'} {test.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">最大値</p>
                      <p className="font-medium">{test.max_value ?? '-'} {test.unit}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>新規テストタイプの追加</CardTitle>
          <CardDescription>カスタムテストタイプを作成します</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="testName">テスト名 *</Label>
                <Input
                  id="testName"
                  type="text"
                  placeholder="例: 60m走"
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">単位 *</Label>
                <Input
                  id="unit"
                  type="text"
                  placeholder="例: 秒"
                  value={newType.unit}
                  onChange={(e) => setNewType({ ...newType, unit: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direction">評価方向</Label>
                <select
                  id="direction"
                  value={newType.direction}
                  onChange={(e) => setNewType({ ...newType, direction: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="decrease">低い方が良い（タイム系）</option>
                  <option value="increase">高い方が良い（距離・回数系）</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minValue">最小値</Label>
                <Input
                  id="minValue"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={newType.min_value}
                  onChange={(e) => setNewType({ ...newType, min_value: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              テストタイプを追加
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
