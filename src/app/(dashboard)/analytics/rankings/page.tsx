'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Activity,
  TrendingUp,
  Heart,
  CalendarCheck,
  Trophy,
} from 'lucide-react';

// Mock rankings data
const generateRankings = (metric: string) => {
  return Array.from({ length: 18 }, (_, i) => ({
    rank: i + 1,
    prevRank: i + 1 + Math.floor(Math.random() * 5) - 2,
    playerName: `選手 ${i + 1}`,
    playerNumber: i + 1,
    position: ['PG', 'SG', 'SF', 'PF', 'C'][i % 5],
    value: metric === '出席率'
      ? `${(95 - i * 2)}%`
      : metric === '改善度'
      ? `+${(15 - i * 0.7).toFixed(1)}%`
      : `${(14.5 - i * 0.15).toFixed(2)}s`,
  }));
};

const rankingCategories = [
  { id: 'speed', label: '速度', icon: Zap, description: '平均タイム（速い順）' },
  { id: 'stability', label: '安定性', icon: Activity, description: '標準偏差（低い順）' },
  { id: 'improvement', label: '改善度', icon: TrendingUp, description: '改善率（高い順）' },
  { id: 'fatigue', label: '疲労耐性', icon: Heart, description: '後半維持率（高い順）' },
  { id: 'attendance', label: '出席率', icon: CalendarCheck, description: '測定参加率（高い順）' },
  { id: 'overall', label: '総合', icon: Trophy, description: '総合スコア（高い順）' },
];

const RankChange = ({ current, previous }: { current: number; previous: number }) => {
  const change = previous - current;

  if (change > 0) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <ArrowUp className="h-4 w-4" />
        <span className="text-xs font-medium">{change}</span>
      </div>
    );
  }

  if (change < 0) {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <ArrowDown className="h-4 w-4" />
        <span className="text-xs font-medium">{Math.abs(change)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-gray-400">
      <Minus className="h-4 w-4" />
    </div>
  );
};

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-lg px-3 py-1">
        1位
      </Badge>
    );
  }

  if (rank === 2) {
    return (
      <Badge className="bg-gray-400 hover:bg-gray-500 text-white font-bold text-lg px-3 py-1">
        2位
      </Badge>
    );
  }

  if (rank === 3) {
    return (
      <Badge className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg px-3 py-1">
        3位
      </Badge>
    );
  }

  return (
    <div className="text-muted-foreground font-semibold text-lg w-12 text-center">
      {rank}位
    </div>
  );
};

const RankingTable = ({ data }: { data: any[] }) => {
  return (
    <div className="space-y-2">
      {data.map((player) => (
        <div
          key={player.rank}
          className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
            player.rank <= 3
              ? 'bg-accent/50 hover:bg-accent border-primary/20'
              : 'hover:bg-accent'
          }`}
        >
          <div className="w-16 flex justify-center">
            <RankBadge rank={player.rank} />
          </div>

          <div className="w-12 flex justify-center">
            <RankChange current={player.rank} previous={player.prevRank} />
          </div>

          <div className="flex-1">
            <div className="font-semibold text-lg">{player.playerName}</div>
            <div className="text-sm text-muted-foreground">
              {player.position} • #{player.playerNumber}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">{player.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function RankingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ランキング</h1>
        <p className="text-muted-foreground mt-2">
          各種指標による選手ランキング
        </p>
      </div>

      <Tabs defaultValue="speed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {rankingCategories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {rankingCategories.map((category) => {
          const Icon = category.icon;
          return (
            <TabsContent key={category.id} value={category.id}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{category.label}ランキング</h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <RankingTable data={generateRankings(category.label)} />

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-green-600" />
                      <span>順位上昇</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-red-600" />
                      <span>順位下降</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-gray-400" />
                      <span>変動なし</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
