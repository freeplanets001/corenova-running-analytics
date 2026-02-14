'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Bell, Mail, MessageSquare, TrendingUp, Trophy, Calendar, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

interface NotificationPrefs {
  [key: string]: boolean
}

const defaultPrefs: NotificationPrefs = {
  'email-notifications': true,
  'push-notifications': true,
  'new-record': true,
  'performance-drop': false,
  'ai-insights': true,
  'goal-progress': true,
  'goal-deadline': true,
  'badge-earned': true,
  'streak-reminder': true,
  'new-session': true,
  'session-reminder': true,
  'team-announcement': true,
  'mentions': true,
  'comments': true,
}

const categories = [
  {
    title: 'データと分析',
    icon: TrendingUp,
    settings: [
      { id: 'new-record', title: '新記録達成時', description: '自己ベストを更新したときに通知' },
      { id: 'performance-drop', title: 'パフォーマンス低下', description: '前回より記録が悪化したときに通知' },
      { id: 'ai-insights', title: 'AIインサイト', description: 'AIが新しいインサイトを生成したときに通知' },
    ],
  },
  {
    title: '目標とゲーミフィケーション',
    icon: Trophy,
    settings: [
      { id: 'goal-progress', title: '目標の進捗', description: '目標達成率が25%ずつ進んだときに通知' },
      { id: 'goal-deadline', title: '目標期限', description: '目標期限の3日前に通知' },
      { id: 'badge-earned', title: 'バッジ獲得', description: '新しいバッジを獲得したときに通知' },
      { id: 'streak-reminder', title: 'ストリーク維持', description: 'ストリークが途切れそうなときに通知' },
    ],
  },
  {
    title: 'セッションとチーム',
    icon: Calendar,
    settings: [
      { id: 'new-session', title: '新規セッション', description: '新しいセッションが作成されたときに通知' },
      { id: 'session-reminder', title: 'セッション前日リマインダー', description: 'セッション前日に通知' },
      { id: 'team-announcement', title: 'チームアナウンス', description: 'チームから重要なお知らせがあるときに通知' },
    ],
  },
  {
    title: 'メッセージと交流',
    icon: MessageSquare,
    settings: [
      { id: 'mentions', title: 'メンション', description: '他のメンバーからメンションされたときに通知' },
      { id: 'comments', title: 'コメント', description: '自分の記録にコメントがついたときに通知' },
    ],
  },
]

export default function NotificationsSettingsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchPrefs = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single()

      if (data?.notification_preferences) {
        setPrefs({ ...defaultPrefs, ...(data.notification_preferences as NotificationPrefs) })
      }
      setLoading(false)
    }
    fetchPrefs()
  }, [user, supabase])

  const handleToggle = async (id: string) => {
    const updated = { ...prefs, [id]: !prefs[id] }
    setPrefs(updated)

    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ notification_preferences: updated })
      .eq('id', user.id)

    if (error) {
      setPrefs(prefs) // revert
      toast.error('設定の保存に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const Toggle = ({ id }: { id: string }) => (
    <button
      id={id}
      role="switch"
      aria-checked={prefs[id]}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        prefs[id] ? 'bg-primary' : 'bg-input'
      }`}
      onClick={() => handleToggle(id)}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
          prefs[id] ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">通知設定</h1>
        <p className="text-muted-foreground mt-2">受け取る通知の種類を管理します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            通知方法
          </CardTitle>
          <CardDescription>通知を受け取る方法を選択してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">メール通知</Label>
              <p className="text-sm text-muted-foreground">登録メールアドレスに通知を送信</p>
            </div>
            <Toggle id="email-notifications" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-base">プッシュ通知</Label>
              <p className="text-sm text-muted-foreground">ブラウザやアプリにプッシュ通知を表示</p>
            </div>
            <Toggle id="push-notifications" />
          </div>
        </CardContent>
      </Card>

      {categories.map((category) => {
        const Icon = category.icon
        return (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor={setting.id} className="text-sm font-medium">{setting.title}</Label>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <Toggle id={setting.id} />
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Bell className="h-5 w-5" />
            通知について
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p>通知設定はいつでも変更できます。重要な通知（セキュリティ関連など）は設定に関わらず送信される場合があります。</p>
        </CardContent>
      </Card>
    </div>
  )
}
