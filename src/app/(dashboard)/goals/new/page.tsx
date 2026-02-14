'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  User,
  TrendingUp,
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/use-auth'

const scopeOptions = [
  { id: 'team', label: 'チーム目標', icon: Users, description: 'チーム全体での達成を目指す' },
  { id: 'personal', label: '個人目標', icon: User, description: '個別の選手に設定' },
  { id: 'group', label: 'グループ目標', icon: Users, description: '特定の選手グループ' },
]

const metricOptions = [
  { id: 'average_value', label: '平均タイム', unit: '秒' },
  { id: 'best_value', label: 'ベストタイム', unit: '秒' },
  { id: 'improvement_rate', label: '改善率', unit: '%' },
  { id: 'consistency', label: '安定性（標準偏差）', unit: '秒' },
  { id: 'attendance', label: '出席率', unit: '%' },
  { id: 'run_count', label: '走行回数', unit: '回' },
]

interface TestTypeOption {
  id: string
  label: string
}

interface PlayerOption {
  id: string
  name: string
}

export default function NewGoalPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [testTypeOptions, setTestTypeOptions] = useState<TestTypeOption[]>([])
  const [playerOptions, setPlayerOptions] = useState<PlayerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scope: 'team',
    metric: 'average_value',
    testType: '',
    targetValue: '',
    targetDate: '',
    selectedPlayers: [] as string[],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testTypesRes, playersRes] = await Promise.all([
          fetch('/api/settings/test-types'),
          fetch('/api/players'),
        ])
        const testTypesJson = await testTypesRes.json()
        const playersJson = await playersRes.json()

        const types: TestTypeOption[] = (testTypesJson.testTypes || []).map((t: { id: string; name: string }) => ({
          id: t.id,
          label: t.name,
        }))
        types.push({ id: 'all', label: 'すべての測定' })
        setTestTypeOptions(types)
        if (types.length > 0) setFormData(prev => ({ ...prev, testType: types[0].id }))

        setPlayerOptions(
          (playersJson.players || []).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
          }))
        )
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      // Map form scope to DB enum ('group' in UI maps to 'individual_target' in DB)
      const dbScope = formData.scope === 'group' ? 'individual_target' : formData.scope

      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          scope: dbScope,
          metric: formData.metric,
          testTypeId: formData.testType !== 'all' ? formData.testType : null,
          targetValue: formData.targetValue,
          targetDate: formData.targetDate,
          playerId: formData.scope === 'personal' ? formData.selectedPlayers[0] : null,
          createdBy: user.id,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '目標の作成に失敗しました')
      }

      toast.success('目標を作成しました')
      router.push('/goals')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '目標の作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const togglePlayer = (playerId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.includes(playerId)
        ? prev.selectedPlayers.filter(id => id !== playerId)
        : [...prev.selectedPlayers, playerId],
    }))
  }

  const selectedMetric = metricOptions.find(m => m.id === formData.metric)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">新規目標作成</h1>
          <p className="text-muted-foreground mt-1">
            チームまたは個人の目標を設定します
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">基本情報</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">目標タイトル *</Label>
              <Input
                id="title"
                placeholder="例: チーム平均タイムを13秒台に"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="目標の詳細や達成方法について記載してください"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">目標範囲</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scopeOptions.map((scope) => {
              const Icon = scope.icon
              const isSelected = formData.scope === scope.id

              return (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, scope: scope.id })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="font-semibold">{scope.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {scope.description}
                  </div>
                </button>
              )
            })}
          </div>

          {formData.scope === 'personal' && (
            <div className="mt-4 p-4 bg-accent rounded-lg">
              <Label className="mb-2 block">対象選手を選択</Label>
              {playerOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">選手が登録されていません</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {playerOptions.map((player) => (
                    <Badge
                      key={player.id}
                      variant={formData.selectedPlayers.includes(player.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => togglePlayer(player.id)}
                    >
                      {player.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">目標設定</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metric">評価指標 *</Label>
              <select
                id="metric"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.metric}
                onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                required
              >
                {metricOptions.map((metric) => (
                  <option key={metric.id} value={metric.id}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testType">測定種目 *</Label>
              <select
                id="testType"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                required
              >
                {testTypeOptions.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">目標値 *</Label>
              <div className="flex gap-2">
                <Input
                  id="targetValue"
                  type="number"
                  step="0.01"
                  placeholder="13.50"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  required
                />
                <div className="flex items-center px-3 border rounded-md bg-accent text-muted-foreground">
                  {selectedMetric?.unit}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">目標期限 *</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <strong>目標プレビュー:</strong>{' '}
                {formData.title || '（タイトル未設定）'}について、
                {testTypeOptions.find(t => t.id === formData.testType)?.label || '（未選択）'}の
                {selectedMetric?.label}を
                {formData.targetValue || '（未設定）'}{selectedMetric?.unit}
                {formData.targetDate && `まで（${formData.targetDate}）`}に達成
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            キャンセル
          </Button>
          <Button type="submit" className="gap-2" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            目標を作成
          </Button>
        </div>
      </form>
    </div>
  )
}
