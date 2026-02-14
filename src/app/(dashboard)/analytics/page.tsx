'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const analyticsTools = [
    {
      id: 'team',
      title: 'チーム分析',
      description: 'チーム全体のパフォーマンス傾向を分析します',
      icon: Users,
      href: '/analytics/team',
      color: 'text-blue-600',
      stats: '12項目の指標'
    },
    {
      id: 'compare',
      title: '選手比較',
      description: '複数の選手のデータを比較分析します',
      icon: BarChart3,
      href: '/analytics/comparison',
      color: 'text-green-600',
      stats: '最大5名まで比較'
    },
    {
      id: 'trends',
      title: 'トレンド分析',
      description: '時系列でのパフォーマンス推移を可視化します',
      icon: TrendingUp,
      href: '/analytics/trends',
      color: 'text-purple-600',
      stats: '期間別表示対応'
    },
    {
      id: 'rankings',
      title: 'ランキング',
      description: '各測定項目のチーム内ランキングを表示します',
      icon: Trophy,
      href: '/analytics/rankings',
      color: 'text-orange-600',
      stats: 'リアルタイム更新'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">分析ハブ</h1>
        <p className="text-muted-foreground mt-2">
          データを多角的に分析し、インサイトを得ることができます
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {analyticsTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} href={tool.href}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-muted ${tool.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{tool.stats}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardDescription className="mt-3">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>分析機能について</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            CORENOVA Analyticsは、測定データから有意義なインサイトを抽出するための包括的な分析ツールです。
          </p>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="min-w-[6px] h-[6px] rounded-full bg-blue-600 mt-2" />
              <div>
                <span className="font-semibold">リアルタイム分析:</span>
                <span className="text-muted-foreground ml-2">データ入力と同時に分析結果が更新されます</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="min-w-[6px] h-[6px] rounded-full bg-green-600 mt-2" />
              <div>
                <span className="font-semibold">視覚化:</span>
                <span className="text-muted-foreground ml-2">グラフやチャートでデータを直感的に理解できます</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="min-w-[6px] h-[6px] rounded-full bg-purple-600 mt-2" />
              <div>
                <span className="font-semibold">エクスポート:</span>
                <span className="text-muted-foreground ml-2">分析結果をPDFやCSVでダウンロードできます</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
