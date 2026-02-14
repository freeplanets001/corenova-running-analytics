'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Award, Calendar, Download, LineChart } from 'lucide-react';

export default function TeamAnalyticsPage() {
  const teamStats = {
    average: 28.9,
    bestPerformer: '佐藤 花子',
    bestTime: 27.5,
    attendanceRate: 87.5,
    improvementRate: 12.3,
    totalSessions: 24,
    activePlayers: 16,
  };

  const topPerformers = [
    { rank: 1, name: '佐藤 花子', average: 27.5, improvement: 15.2 },
    { rank: 2, name: '伊藤 さくら', average: 27.8, improvement: 13.8 },
    { rank: 3, name: '田中 太郎', average: 28.6, improvement: 11.4 },
    { rank: 4, name: '山田 美咲', average: 28.8, improvement: 10.9 },
    { rank: 5, name: '高橋 健太', average: 29.6, improvement: 9.5 },
  ];

  const recentSessions = [
    { date: '2024-01-15', average: 28.5, attendance: 15 },
    { date: '2024-01-14', average: 28.9, attendance: 14 },
    { date: '2024-01-13', average: 29.2, attendance: 16 },
    { date: '2024-01-12', average: 28.7, attendance: 15 },
    { date: '2024-01-11', average: 29.1, attendance: 13 },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">チーム分析</h1>
          <p className="text-gray-500 mt-2">チーム全体のパフォーマンスと統計</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          レポート出力
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              チーム平均タイム
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teamStats.average}秒</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3" />
              前月比 -2.3秒改善
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Award className="h-4 w-4" />
              最優秀選手
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.bestPerformer}</div>
            <p className="text-xs text-gray-500 mt-2">
              平均 {teamStats.bestTime}秒
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              出席率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teamStats.attendanceRate}%</div>
            <p className="text-xs text-gray-500 mt-2">
              平均 {teamStats.activePlayers}名参加
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              改善率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+{teamStats.improvementRate}%</div>
            <p className="text-xs text-gray-500 mt-2">
              過去30日間
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Average Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            チーム平均タイム推移
          </CardTitle>
          <CardDescription>
            過去30日間のチーム平均パフォーマンス
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder Chart Area */}
          <div className="h-80 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <LineChart className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg font-medium">折れ線グラフエリア</p>
              <p className="text-sm mt-2">チーム平均タイムの推移を表示</p>
            </div>
          </div>
          {/* Simple data visualization */}
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[28.5, 28.9, 29.2, 28.7, 29.1].map((value, index) => (
              <div key={index} className="text-center">
                <div className="h-32 bg-gray-100 rounded flex items-end justify-center pb-2">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${((30 - value) / 3) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">1/{11 + index}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              トップパフォーマー
            </CardTitle>
            <CardDescription>
              平均タイム上位5名
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((player) => (
                <div
                  key={player.rank}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        player.rank === 1
                          ? 'bg-yellow-100 text-yellow-700'
                          : player.rank === 2
                          ? 'bg-gray-200 text-gray-700'
                          : player.rank === 3
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {player.rank}
                    </div>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-gray-500">平均 {player.average}秒</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-green-600">
                    +{player.improvement}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              最近のセッション
            </CardTitle>
            <CardDescription>
              直近5回の練習セッション
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{session.date}</p>
                    <p className="text-sm text-gray-500">
                      出席: {session.attendance}名
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{session.average}秒</p>
                    <p className="text-xs text-gray-500">平均タイム</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>パフォーマンスヒートマップ</CardTitle>
          <CardDescription>
            選手別・日付別のパフォーマンス可視化
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-grid grid-cols-6 gap-1 min-w-full">
              {/* Header row */}
              <div className="p-2"></div>
              {['1/11', '1/12', '1/13', '1/14', '1/15'].map((date) => (
                <div key={date} className="p-2 text-center text-sm font-medium">
                  {date}
                </div>
              ))}

              {/* Data rows */}
              {topPerformers.slice(0, 8).map((player) => (
                <>
                  <div className="p-2 text-sm font-medium text-right pr-4">
                    {player.name}
                  </div>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const intensity = Math.random();
                    return (
                      <div
                        key={i}
                        className={`p-2 rounded ${
                          intensity > 0.7
                            ? 'bg-green-600'
                            : intensity > 0.4
                            ? 'bg-green-400'
                            : 'bg-green-200'
                        }`}
                        title={`${(27 + Math.random() * 3).toFixed(1)}秒`}
                      ></div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>遅い</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span>標準</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>速い</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
