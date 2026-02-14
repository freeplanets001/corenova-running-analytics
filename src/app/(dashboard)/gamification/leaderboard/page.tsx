'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Trophy, Medal, TrendingUp, TrendingDown, User } from 'lucide-react';

export default function LeaderboardPage() {
  const leaderboardData = [
    {
      rank: 1,
      name: '鈴木 一郎',
      jerseyNumber: '10',
      position: 'SG',
      score: 1250,
      trend: 'up',
      change: 2,
      badges: 8
    },
    {
      rank: 2,
      name: '高橋 美咲',
      jerseyNumber: '7',
      position: 'SF',
      score: 1180,
      trend: 'same',
      change: 0,
      badges: 7
    },
    {
      rank: 3,
      name: '田中 健太',
      jerseyNumber: '15',
      position: 'PF',
      score: 1150,
      trend: 'up',
      change: 1,
      badges: 6
    },
    {
      rank: 4,
      name: '佐々木 翔',
      jerseyNumber: '8',
      position: 'PG',
      score: 1090,
      trend: 'down',
      change: -2,
      badges: 6
    },
    {
      rank: 5,
      name: '伊藤 優',
      jerseyNumber: '12',
      position: 'C',
      score: 1050,
      trend: 'up',
      change: 3,
      badges: 5
    },
    {
      rank: 6,
      name: '渡辺 大輔',
      jerseyNumber: '20',
      position: 'SF',
      score: 980,
      trend: 'down',
      change: -1,
      badges: 5
    },
    {
      rank: 7,
      name: '山田 太郎',
      jerseyNumber: '23',
      position: 'PG',
      score: 950,
      trend: 'up',
      change: 2,
      badges: 4
    },
    {
      rank: 8,
      name: '中村 航',
      jerseyNumber: '5',
      position: 'SG',
      score: 920,
      trend: 'same',
      change: 0,
      badges: 4
    },
    {
      rank: 9,
      name: '小林 拓',
      jerseyNumber: '18',
      position: 'PF',
      score: 890,
      trend: 'down',
      change: -1,
      badges: 3
    },
    {
      rank: 10,
      name: '加藤 誠',
      jerseyNumber: '3',
      position: 'C',
      score: 860,
      trend: 'up',
      change: 1,
      badges: 3
    }
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>;
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-medium">+{change}</span>
        </div>
      );
    }
    if (trend === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="h-4 w-4" />
          <span className="text-xs font-medium">{change}</span>
        </div>
      );
    }
    return <span className="text-xs text-muted-foreground">-</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">リーダーボード</h1>
        <p className="text-muted-foreground mt-2">
          チーム内のパフォーマンスランキング
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {leaderboardData.slice(0, 3).map((player, index) => (
          <Card
            key={player.rank}
            className={`${
              index === 0 ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' :
              index === 1 ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50' :
              'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRankBadge(player.rank)}
                </div>
                {getTrendIcon(player.trend, player.change)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2">
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{player.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">#{player.jerseyNumber}</Badge>
                    <span>{player.position}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">スコア</span>
                <span className="text-xl font-bold">{player.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">獲得バッジ</span>
                <span className="text-lg font-semibold">{player.badges}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全体ランキング</CardTitle>
          <CardDescription>チーム内の総合スコアランキング</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboardData.map((player) => (
              <div
                key={player.rank}
                className={`flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors ${
                  player.rank <= 3 ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 flex items-center justify-center">
                    {getRankBadge(player.rank)}
                  </div>
                  <Avatar className="h-10 w-10 border">
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{player.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">#{player.jerseyNumber}</Badge>
                      <span>{player.position}</span>
                      <span>•</span>
                      <span>{player.badges} バッジ</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {getTrendIcon(player.trend, player.change)}
                  <div className="text-right min-w-[80px]">
                    <p className="text-2xl font-bold">{player.score.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">ポイント</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">スコアについて</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            リーダーボードのスコアは以下の要素から計算されます：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>測定データの記録（各テストタイプの成績）</li>
            <li>自己ベスト更新回数</li>
            <li>獲得バッジ数</li>
            <li>ストリーク維持日数</li>
            <li>セッション参加率</li>
          </ul>
          <p className="mt-3">
            ランキングは毎日深夜に更新されます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
