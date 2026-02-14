'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, MapPin } from 'lucide-react';

export default function SessionsPage() {
  // Mock data - will be replaced with Supabase data
  const mockSessions = [
    {
      id: 1,
      date: '2024-02-10',
      testType: '垂直跳び',
      participantCount: 12,
      location: '体育館A',
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-02-08',
      testType: '20mシャトルラン',
      participantCount: 15,
      location: '体育館B',
      status: 'completed'
    },
    {
      id: 3,
      date: '2024-02-05',
      testType: 'スプリント測定',
      participantCount: 10,
      location: 'グラウンド',
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">セッション一覧</h1>
          <p className="text-muted-foreground mt-2">
            測定セッションを管理します
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規セッション
        </Button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>開発中:</strong> Supabaseデータベースとの連携を準備中です。現在はモックデータを表示しています。
        </p>
      </div>

      <div className="grid gap-4">
        {mockSessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{session.testType}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {session.location}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="secondary">完了</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{session.participantCount}名参加</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockSessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">セッションがありません</p>
            <p className="text-sm text-muted-foreground mt-1">
              「新規セッション」ボタンから最初のセッションを作成しましょう
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
