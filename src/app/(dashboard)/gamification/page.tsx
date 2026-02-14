'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Star, Award, Zap, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GamificationPage() {
  const badges = [
    {
      id: 1,
      name: '初心者',
      description: '最初のデータを記録',
      icon: Star,
      earned: true,
      earnedDate: '2024-01-15'
    },
    {
      id: 2,
      name: '継続は力なり',
      description: '7日連続でデータを記録',
      icon: Flame,
      earned: true,
      earnedDate: '2024-02-01'
    },
    {
      id: 3,
      name: 'ジャンプマスター',
      description: '垂直跳び70cm達成',
      icon: Zap,
      earned: false,
      progress: 85
    },
    {
      id: 4,
      name: 'チームプレイヤー',
      description: '10回のセッションに参加',
      icon: Target,
      earned: true,
      earnedDate: '2024-02-10'
    },
    {
      id: 5,
      name: 'エリート',
      description: 'すべてのテストでトップ10入り',
      icon: Trophy,
      earned: false,
      progress: 60
    },
    {
      id: 6,
      name: '記録更新',
      description: '自己ベストを5回更新',
      icon: Award,
      earned: false,
      progress: 40
    }
  ];

  const streaks = [
    {
      name: 'トレーニング継続',
      current: 12,
      best: 18,
      unit: '日'
    },
    {
      name: '週次参加',
      current: 4,
      best: 7,
      unit: '週'
    }
  ];

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ゲーミフィケーション</h1>
        <p className="text-muted-foreground mt-2">
          バッジを獲得し、ストリークを維持してモチベーションを高めましょう
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">獲得バッジ</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnedBadges.length}</div>
            <p className="text-xs text-muted-foreground">全{badges.length}個中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">現在のストリーク</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streaks[0].current}日</div>
            <p className="text-xs text-muted-foreground">最高記録: {streaks[0].best}日</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ランキング</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#7</div>
            <p className="text-xs text-muted-foreground">チーム内順位</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ストリーク</CardTitle>
              <CardDescription>継続的な参加でストリークを維持しましょう</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {streaks.map((streak) => (
            <div key={streak.name} className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">{streak.name}</p>
                  <p className="text-sm text-muted-foreground">最高記録: {streak.best}{streak.unit}</p>
                </div>
              </div>
              <div className="text-2xl font-bold">{streak.current}{streak.unit}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">獲得済みバッジ</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {earnedBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <Card key={badge.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100">
                      <Icon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{badge.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">{badge.description}</CardDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        獲得日: {badge.earnedDate}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">未獲得バッジ</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lockedBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <Card key={badge.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{badge.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">{badge.description}</CardDescription>
                      {badge.progress && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">進捗</span>
                            <span className="font-medium">{badge.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${badge.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <Link href="/gamification/leaderboard">
        <Card className="hover:shadow-lg transition-all cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <div>
                  <CardTitle>リーダーボード</CardTitle>
                  <CardDescription>チーム内のランキングを確認</CardDescription>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}
