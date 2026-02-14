'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, Award, Target } from 'lucide-react';

// Mock data for 18 players
const mockPlayers = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: `選手 ${i + 1}`,
  number: i + 1,
  position: ['PG', 'SG', 'SF', 'PF', 'C'][i % 5],
  sparklineData: Array.from({ length: 10 }, () => Math.random() * 100 + 50),
  trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
  improvementRate: (Math.random() * 20 - 5).toFixed(1),
  currentAvg: (Math.random() * 2 + 13).toFixed(2),
}));

const improvementRankings = [...mockPlayers]
  .sort((a, b) => parseFloat(b.improvementRate) - parseFloat(a.improvementRate))
  .slice(0, 10);

const phaseAnalysis = [
  { phase: 'フェーズ1 (0-10m)', avgTime: '1.82', trend: 'up', improvement: '+2.3%' },
  { phase: 'フェーズ2 (10-20m)', avgTime: '1.15', trend: 'up', improvement: '+3.1%' },
  { phase: 'フェーズ3 (20-30m)', avgTime: '1.08', trend: 'stable', improvement: '+0.5%' },
  { phase: 'フェーズ4 (30-40m)', avgTime: '1.05', trend: 'down', improvement: '-1.2%' },
  { phase: 'フェーズ5 (40-50m)', avgTime: '1.03', trend: 'up', improvement: '+1.8%' },
  { phase: 'フェーズ6 (50-60m)', avgTime: '1.01', trend: 'up', improvement: '+2.5%' },
];

const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 30" className="w-full h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-blue-500"
      />
    </svg>
  );
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
};

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">トレンド分析</h1>
        <p className="text-muted-foreground mt-2">
          選手のパフォーマンストレンドと改善傾向を分析します
        </p>
      </div>

      <Tabs defaultValue="sparklines" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sparklines">選手別推移</TabsTrigger>
          <TabsTrigger value="rankings">改善ランキング</TabsTrigger>
          <TabsTrigger value="phases">フェーズ分析</TabsTrigger>
        </TabsList>

        <TabsContent value="sparklines" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">選手別パフォーマンス推移</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPlayers.map((player) => (
                <Card key={player.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{player.name}</span>
                        <Badge variant="outline" className="text-xs">
                          #{player.number}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {player.position} • 平均: {player.currentAvg}s
                      </div>
                    </div>
                    <TrendIcon trend={player.trend} />
                  </div>
                  <Sparkline data={player.sparklineData} />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">改善率</span>
                    <span
                      className={
                        parseFloat(player.improvementRate) > 0
                          ? 'text-green-600 font-medium'
                          : parseFloat(player.improvementRate) < 0
                          ? 'text-red-600 font-medium'
                          : 'text-gray-600'
                      }
                    >
                      {parseFloat(player.improvementRate) > 0 ? '+' : ''}
                      {player.improvementRate}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold">改善度ランキング</h2>
            </div>
            <div className="space-y-2">
              {improvementRankings.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {index < 3 ? (
                      <Badge
                        variant={
                          index === 0 ? 'default' : 'secondary'
                        }
                        className={
                          index === 0
                            ? 'bg-yellow-500'
                            : index === 1
                            ? 'bg-gray-400'
                            : 'bg-orange-600'
                        }
                      >
                        {index + 1}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground font-medium">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {player.position} • #{player.number}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-green-600">
                      +{player.improvementRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      現在平均: {player.currentAvg}s
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold">フェーズ別分析</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              60m走を10m刻みでフェーズ分割した平均タイムとトレンド
            </p>
            <div className="space-y-3">
              {phaseAnalysis.map((phase, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="font-medium">{phase.phase}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      チーム平均タイム
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{phase.avgTime}s</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendIcon trend={phase.trend} />
                    <span
                      className={
                        phase.trend === 'up'
                          ? 'text-green-600 font-medium'
                          : phase.trend === 'down'
                          ? 'text-red-600 font-medium'
                          : 'text-gray-600'
                      }
                    >
                      {phase.improvement}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm">
                <strong>分析サマリー:</strong> フェーズ2（10-20m）で最大の改善が見られます。
                フェーズ4（30-40m）でやや減速傾向にあり、この区間の強化が推奨されます。
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
