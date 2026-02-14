'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Award,
  Clock,
  BarChart3,
  LineChart,
} from 'lucide-react';

// Mock player data
const getPlayerData = (id: string) => ({
  id,
  name: `選手 ${id}`,
  number: parseInt(id),
  position: ['PG', 'SG', 'SF', 'PF', 'C'][parseInt(id) % 5],
  email: `player${id}@corenova.jp`,
  phone: '090-1234-5678',
  joinDate: '2024-04-01',
  avatar: null,
  kpis: [
    { label: '平均タイム', value: '13.45s', icon: Clock, trend: '+2.3%', trendUp: true },
    { label: 'ベストタイム', value: '12.89s', icon: Zap, trend: 'シーズンベスト', trendUp: true },
    { label: '安定性', value: '0.34s', icon: Activity, trend: '改善', trendUp: true },
    { label: '改善率', value: '+8.5%', icon: TrendingUp, trend: '30日間', trendUp: true },
    { label: '測定回数', value: '24回', icon: Calendar, trend: '出席率 96%', trendUp: true },
    { label: 'ランク', value: '3位', icon: Award, trend: '前回: 5位', trendUp: true },
  ],
  recentPerformance: Array.from({ length: 12 }, (_, i) => ({
    date: `2024-${String(Math.floor(i / 4) + 10).padStart(2, '0')}-${String((i % 4) * 7 + 1).padStart(2, '0')}`,
    time: (13.5 - i * 0.1 + Math.random() * 0.3).toFixed(2),
  })),
  radarData: [
    { category: '加速力', value: 85 },
    { category: '最高速度', value: 78 },
    { category: '安定性', value: 92 },
    { category: '疲労耐性', value: 88 },
    { category: '改善度', value: 95 },
  ],
});

export default function PlayerProfilePage({ params }: { params: { id: string } }) {
  const player = getPlayerData(params.id);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {player.number}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{player.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="default" className="text-base px-3 py-1">
                    #{player.number}
                  </Badge>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {player.position}
                  </Badge>
                </div>
              </div>

              <Button>プロフィール編集</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{player.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{player.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">入団: {player.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {player.kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {kpi.trendUp && (
                  <Badge variant="secondary" className="text-xs">
                    {kpi.trend}
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">{kpi.label}</div>
                <div className="text-2xl font-bold mt-1">{kpi.value}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Performance Details */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">パフォーマンス推移</TabsTrigger>
          <TabsTrigger value="radar">能力分析</TabsTrigger>
          <TabsTrigger value="stats">詳細統計</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <LineChart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">パフォーマンスタイムライン</h2>
            </div>

            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>タイムライングラフ表示エリア</p>
                <p className="text-sm mt-1">折れ線グラフで過去12回の測定結果を表示</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-accent rounded-lg">
                <div className="text-muted-foreground">最新</div>
                <div className="text-lg font-bold mt-1">
                  {player.recentPerformance[0].time}s
                </div>
              </div>
              <div className="text-center p-3 bg-accent rounded-lg">
                <div className="text-muted-foreground">ベスト</div>
                <div className="text-lg font-bold mt-1">12.89s</div>
              </div>
              <div className="text-center p-3 bg-accent rounded-lg">
                <div className="text-muted-foreground">ワースト</div>
                <div className="text-lg font-bold mt-1">14.21s</div>
              </div>
              <div className="text-center p-3 bg-accent rounded-lg">
                <div className="text-muted-foreground">平均</div>
                <div className="text-lg font-bold mt-1">13.45s</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">能力レーダーチャート</h2>
            </div>

            <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>レーダーチャート表示エリア</p>
                <p className="text-sm mt-1">5軸のレーダーチャートで能力を可視化</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {player.radarData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{data.category}</div>
                  <div className="flex-1">
                    <div className="h-3 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: `${data.value}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right font-semibold">{data.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">詳細統計データ</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">全期間統計</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>測定回数</span>
                      <span className="font-semibold">24回</span>
                    </div>
                    <div className="flex justify-between">
                      <span>平均タイム</span>
                      <span className="font-semibold">13.45s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>標準偏差</span>
                      <span className="font-semibold">0.34s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>変動係数</span>
                      <span className="font-semibold">2.5%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">直近30日</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>測定回数</span>
                      <span className="font-semibold">8回</span>
                    </div>
                    <div className="flex justify-between">
                      <span>平均タイム</span>
                      <span className="font-semibold">13.12s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>改善率</span>
                      <span className="font-semibold text-green-600">+8.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>出席率</span>
                      <span className="font-semibold">100%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-3">フェーズ別平均タイム</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['0-10m', '10-20m', '20-30m', '30-40m', '40-50m', '50-60m'].map((phase, i) => (
                    <div key={i} className="text-center p-2 bg-accent rounded">
                      <div className="text-xs text-muted-foreground">{phase}</div>
                      <div className="font-semibold mt-1">
                        {(1.8 - i * 0.12).toFixed(2)}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
