'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { ROUTES } from '@/lib/constants/routes'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { User, Mail, Shield, Upload, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileData {
  display_name: string
  player_name: string | null
  jersey_number: number | null
  position: string | null
  date_of_birth: string | null
  height_cm: number | null
  weight_kg: number | null
}

export default function ProfileSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [form, setForm] = useState<ProfileData>({
    display_name: '',
    player_name: null,
    jersey_number: null,
    position: null,
    date_of_birth: null,
    height_cm: null,
    weight_kg: null,
  })

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, email, player_name, jersey_number, position, date_of_birth, height_cm, weight_kg')
        .eq('id', user.id)
        .single()

      if (error) {
        toast.error('プロフィールの取得に失敗しました')
        setLoading(false)
        return
      }

      setEmail(data.email)
      setForm({
        display_name: data.display_name || '',
        player_name: data.player_name,
        jersey_number: data.jersey_number,
        position: data.position,
        date_of_birth: data.date_of_birth,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
      })
      setLoading(false)
    }

    fetchProfile()
  }, [user, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name,
        player_name: form.player_name,
        jersey_number: form.jersey_number,
        position: form.position,
        date_of_birth: form.date_of_birth,
        height_cm: form.height_cm,
        weight_kg: form.weight_kg,
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      toast.error('プロフィールの更新に失敗しました')
      return
    }

    toast.success('プロフィールを更新しました')
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">プロフィール設定</h1>
        <p className="text-muted-foreground mt-2">
          個人情報とプロフィールを管理します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>アカウントの基本情報を編集します</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-muted">
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              </Avatar>
              <div className="space-y-2">
                <Label>プロフィール画像</Label>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  画像をアップロード
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG、PNG形式。最大5MB
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">表示名</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="表示名を入力"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="pr-10"
                  />
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  メールアドレスは変更できません
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">選手情報</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="playerName">選手名</Label>
                  <Input
                    id="playerName"
                    type="text"
                    placeholder="選手名を入力"
                    value={form.player_name || ''}
                    onChange={(e) => setForm({ ...form, player_name: e.target.value || null })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jerseyNumber">背番号</Label>
                  <Input
                    id="jerseyNumber"
                    type="number"
                    placeholder="背番号"
                    value={form.jersey_number ?? ''}
                    onChange={(e) => setForm({ ...form, jersey_number: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">ポジション</Label>
                  <select
                    id="position"
                    value={form.position || ''}
                    onChange={(e) => setForm({ ...form, position: e.target.value || null })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">選択してください</option>
                    <option value="S">セッター (S)</option>
                    <option value="OH">アウトサイドヒッター (OH)</option>
                    <option value="MB">ミドルブロッカー (MB)</option>
                    <option value="OP">オポジット (OP)</option>
                    <option value="L">リベロ (L)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">身長 (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="175"
                    value={form.height_cm ?? ''}
                    onChange={(e) => setForm({ ...form, height_cm: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">体重 (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={form.weight_kg ?? ''}
                    onChange={(e) => setForm({ ...form, weight_kg: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">生年月日</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={form.date_of_birth || ''}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value || null })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                変更を保存
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="h-5 w-5" />
            プライバシーについて
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p>
            あなたの個人情報は安全に保護されています。プロフィール情報はチームメンバーと共有されますが、
            メールアドレスなどの機密情報は管理者のみが閲覧できます。
          </p>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">アカウント操作</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={async () => {
              await fetch('/api/auth/signout', { method: 'POST' })
              window.location.href = ROUTES.LOGIN
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
