'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

export default function GoalsPage() {
  // Mock data
  const mockGoals = [
    {
      id: 1,
      title: '垂直跳び70cm達成',
      description: '3ヶ月以内に垂直跳び70cmを達成する',
      current: 65,
      target: 70,
      unit: 'cm',
      deadline: '2024-05-15',
      status: 'active',
      progress: 92.8
    },
    {
      id: 2,
      title: '体重5kg減量',
      description: '健康的な体重管理',
      current: 78,
      target: 73,
      unit: 'kg',
      deadline: '2024-06-01',
      status: 'active',
      progress: 60
    },
    {
      id: 3,
      title: 'シャトルラン記録更新',
      description: '前回の記録を10回以上更新',
      current: 85,
      target: 95,
      unit: '回',
      deadline: '2024-04-30',
      status: 'active',
      progress: 89.4
    }
  ];

  const completedGoals = [
    {
      id: 4,
      title: 'スプリント記録向上',
      description: '20m走を0.2秒短縮',
      achieved: '2024-02-01',
      status: 'completed'
    }
  ];

  const renderGoalCard = (goal: any) => (
    <Card key={goal.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <CardDescription>{goal.description}</CardDescription>
          </div>
          <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
            {goal.status === 'active' ? '進行中' : '達成'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goal.status === 'active' && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">進捗</span>
                <span className="font-semibold">{goal.progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>現在: {goal.current}{goal.unit}</span>
                <span>目標: {goal.target}{goal.unit}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>期限: {goal.deadline}</span>
            </div>
          </>
        )}
        {goal.status === 'completed' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>達成日: {goal.achieved}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">目標管理</h1>
          <p className="text-muted-foreground mt-2">
            個人目標を設定し、進捗を追跡します
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          目標を作成
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中の目標</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGoals.length}</div>
            <p className="text-xs text-muted-foreground">アクティブな目標</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">達成済み</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals.length}</div>
            <p className="text-xs text-muted-foreground">今月達成した目標</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均進捗率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockGoals.reduce((sum, g) => sum + g.progress, 0) / mockGoals.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">全目標の平均</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">進行中</TabsTrigger>
          <TabsTrigger value="completed">達成済み</TabsTrigger>
          <TabsTrigger value="all">すべて</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {mockGoals.map(renderGoalCard)}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedGoals.map(renderGoalCard)}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {[...mockGoals, ...completedGoals].map(renderGoalCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
