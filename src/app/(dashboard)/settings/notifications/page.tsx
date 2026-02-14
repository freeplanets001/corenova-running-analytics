'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, TrendingUp, Trophy, Calendar } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const notificationSettings = [
    {
      category: 'データと分析',
      icon: TrendingUp,
      settings: [
        {
          id: 'new-record',
          title: '新記録達成時',
          description: '自己ベストを更新したときに通知',
          enabled: true
        },
        {
          id: 'performance-drop',
          title: 'パフォーマンス低下',
          description: '前回より記録が悪化したときに通知',
          enabled: false
        },
        {
          id: 'ai-insights',
          title: 'AIインサイト',
          description: 'AIが新しいインサイトを生成したときに通知',
          enabled: true
        }
      ]
    },
    {
      category: '目標とゲーミフィケーション',
      icon: Trophy,
      settings: [
        {
          id: 'goal-progress',
          title: '目標の進捗',
          description: '目標達成率が25%ずつ進んだときに通知',
          enabled: true
        },
        {
          id: 'goal-deadline',
          title: '目標期限',
          description: '目標期限の3日前に通知',
          enabled: true
        },
        {
          id: 'badge-earned',
          title: 'バッジ獲得',
          description: '新しいバッジを獲得したときに通知',
          enabled: true
        },
        {
          id: 'streak-reminder',
          title: 'ストリーク維持',
          description: 'ストリークが途切れそうなときに通知',
          enabled: true
        }
      ]
    },
    {
      category: 'セッションとチーム',
      icon: Calendar,
      settings: [
        {
          id: 'new-session',
          title: '新規セッション',
          description: '新しいセッションが作成されたときに通知',
          enabled: true
        },
        {
          id: 'session-reminder',
          title: 'セッション前日リマインダー',
          description: 'セッション前日に通知',
          enabled: true
        },
        {
          id: 'team-announcement',
          title: 'チームアナウンス',
          description: 'チームから重要なお知らせがあるときに通知',
          enabled: true
        }
      ]
    },
    {
      category: 'メッセージと交流',
      icon: MessageSquare,
      settings: [
        {
          id: 'mentions',
          title: 'メンション',
          description: '他のメンバーからメンションされたときに通知',
          enabled: true
        },
        {
          id: 'comments',
          title: 'コメント',
          description: '自分の記録にコメントがついたときに通知',
          enabled: true
        }
      ]
    }
  ];

  const handleToggle = (id: string) => {
    console.log(`Toggle notification: ${id}`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">通知設定</h1>
        <p className="text-muted-foreground mt-2">
          受け取る通知の種類を管理します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            通知方法
          </CardTitle>
          <CardDescription>
            通知を受け取る方法を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">
                メール通知
              </Label>
              <p className="text-sm text-muted-foreground">
                登録メールアドレスに通知を送信
              </p>
            </div>
            <button
              id="email-notifications"
              role="switch"
              aria-checked="true"
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary"
              onClick={() => handleToggle('email-notifications')}
            >
              <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-5" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-base">
                プッシュ通知
              </Label>
              <p className="text-sm text-muted-foreground">
                ブラウザやアプリにプッシュ通知を表示
              </p>
            </div>
            <button
              id="push-notifications"
              role="switch"
              aria-checked="true"
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary"
              onClick={() => handleToggle('push-notifications')}
            >
              <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {notificationSettings.map((category) => {
        const Icon = category.icon;
        return (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor={setting.id} className="text-sm font-medium">
                      {setting.title}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <button
                    id={setting.id}
                    role="switch"
                    aria-checked={setting.enabled}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      setting.enabled ? 'bg-primary' : 'bg-input'
                    }`}
                    onClick={() => handleToggle(setting.id)}
                  >
                    <span
                      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                        setting.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Bell className="h-5 w-5" />
            通知について
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p>
            通知設定はいつでも変更できます。重要な通知（セキュリティ関連など）は設定に関わらず送信される場合があります。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
