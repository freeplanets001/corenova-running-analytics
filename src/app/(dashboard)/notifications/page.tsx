'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, TrendingUp, Trophy, Calendar, MessageSquare, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'achievement',
      icon: Trophy,
      title: '新しいバッジを獲得しました',
      message: '「継続は力なり」バッジを獲得しました。おめでとうございます！',
      timestamp: '5分前',
      read: false,
      color: 'text-yellow-600'
    },
    {
      id: 2,
      type: 'insight',
      icon: TrendingUp,
      title: 'パフォーマンスが向上しています',
      message: '垂直跳びの記録が先月比で5%向上しています。素晴らしい進歩です。',
      timestamp: '2時間前',
      read: false,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'session',
      icon: Calendar,
      title: '新しいセッションが作成されました',
      message: '2024年2月15日の「スプリント測定」セッションが作成されました。',
      timestamp: '3時間前',
      read: true,
      color: 'text-blue-600'
    },
    {
      id: 4,
      type: 'comment',
      icon: MessageSquare,
      title: 'コメントが追加されました',
      message: '佐藤コーチがあなたの最新記録にコメントしました。',
      timestamp: '1日前',
      read: true,
      color: 'text-purple-600'
    },
    {
      id: 5,
      type: 'achievement',
      icon: Trophy,
      title: '自己ベスト更新',
      message: '20mシャトルランで自己ベストを更新しました！',
      timestamp: '2日前',
      read: true,
      color: 'text-yellow-600'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const renderNotification = (notification: typeof notifications[0]) => {
    const Icon = notification.icon;
    return (
      <Card
        key={notification.id}
        className={`hover:shadow-md transition-shadow ${
          !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
        }`}
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-muted ${notification.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold">
                  {notification.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <Badge variant="default" className="text-xs">新着</Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{notification.message}</CardDescription>
              <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">通知</h1>
          <p className="text-muted-foreground mt-2">
            最新の更新情報とアクティビティを確認します
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CheckCheck className="mr-2 h-4 w-4" />
            すべて既読
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未読通知</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">新しい通知があります</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日の通知</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(n => n.timestamp.includes('分前') || n.timestamp.includes('時間前')).length}
            </div>
            <p className="text-xs text-muted-foreground">本日受信した通知</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総通知数</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">保存中の通知</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            すべて
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            未読
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">既読</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {notifications.map(renderNotification)}
          {notifications.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">通知はありません</p>
                <p className="text-sm text-muted-foreground mt-1">
                  新しい通知が届くとここに表示されます
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {unreadNotifications.map(renderNotification)}
          {unreadNotifications.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">未読通知はありません</p>
                <p className="text-sm text-muted-foreground mt-1">
                  すべての通知を確認しました
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-3">
          {readNotifications.map(renderNotification)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
