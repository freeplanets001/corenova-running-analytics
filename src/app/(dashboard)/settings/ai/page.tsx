'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Key, CheckCircle2, AlertCircle, Brain } from 'lucide-react'
import { toast } from 'sonner'

interface AISettings {
  provider: string
  modelName: string
  isConfigured: boolean
  updatedAt: string | null
}

const GEMINI_MODELS = [
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (推奨)' },
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite (低コスト)' },
  { value: 'gemini-2.5-pro-preview-05-06', label: 'Gemini 2.5 Pro (高精度)' },
  { value: 'gemini-2.5-flash-preview-04-17', label: 'Gemini 2.5 Flash Preview' },
]

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState('gemini-2.0-flash')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings/ai')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setModelName(data.modelName || 'gemini-2.0-flash')
      }
    } catch {
      // Settings not configured yet
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    if (!apiKey.trim()) {
      toast.error('APIキーを入力してください')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim(), modelName }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'APIキーの保存に失敗しました')
        return
      }

      toast.success('AI設定を保存しました')
      setApiKey('')
      fetchSettings()
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI設定</h1>
        <p className="text-muted-foreground">
          AI分析機能に使用するGoogle Gemini APIの設定
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            接続ステータス
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settings?.isConfigured ? (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">接続済み</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  モデル: {settings.modelName}
                  {settings.updatedAt && ` | 最終更新: ${new Date(settings.updatedAt).toLocaleString('ja-JP')}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">未設定</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  AI機能を使用するにはAPIキーを設定してください
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Key Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            APIキー設定
          </CardTitle>
          <CardDescription>
            Google AI Studio (https://aistudio.google.com/apikey) からAPIキーを取得してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Gemini APIキー</Label>
            <Input
              id="api-key"
              type="password"
              placeholder={settings?.isConfigured ? '••••••••（設定済み・変更する場合は新しいキーを入力）' : 'AIza...'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">AIモデル</Label>
            <select
              id="model"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {GEMINI_MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <Button onClick={handleSave} disabled={isSaving || !apiKey.trim()} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                検証中...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                {settings?.isConfigured ? 'APIキーを更新' : 'APIキーを保存'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>AI機能について</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>APIキーを設定すると、以下のAI機能が利用可能になります:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>セッションデータの自動分析・インサイト生成</li>
            <li>選手別のネクストアクション提案</li>
            <li>AIチャットによるデータ質問応答</li>
            <li>週次/月次レポートの自動生成</li>
            <li>トレンドに基づく目標提案</li>
          </ul>
          <p className="pt-2">
            APIの利用料金はGoogle AI Studioの料金体系に準じます。
            Gemini 2.0 Flashは無料枠があります。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
