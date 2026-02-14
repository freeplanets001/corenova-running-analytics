'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle, FileText, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AIPage() {
  const mockInsights = [
    {
      id: 1,
      title: '垂直跳びのパフォーマンス向上が見られます',
      description: '先月と比較して平均3.2cm向上しています。この調子でトレーニングを継続しましょう。',
      type: 'positive',
      timestamp: '2時間前',
      icon: TrendingUp
    },
    {
      id: 2,
      title: 'スプリントタイムの改善余地があります',
      description: 'チーム平均と比較して0.5秒遅れています。加速フェーズの改善に焦点を当てることをお勧めします。',
      type: 'suggestion',
      timestamp: '5時間前',
      icon: Lightbulb
    },
    {
      id: 3,
      title: '週次トレーニングパターンを分析しました',
      description: '火曜日と木曜日のトレーニング後にパフォーマンスの向上が見られます。',
      type: 'insight',
      timestamp: '1日前',
      icon: Sparkles
    }
  ];

  const aiFeatures = [
    {
      title: 'AIチャット',
      description: 'データについて質問し、AIから即座に回答を得られます',
      href: '/ai/chat',
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    {
      title: 'AIレポート',
      description: '週次・月次のパフォーマンスレポートを自動生成します',
      href: '/ai/reports',
      icon: FileText,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AIインサイト</h1>
        <p className="text-muted-foreground mt-2">
          AIがあなたのパフォーマンスデータを分析し、有益なインサイトを提供します
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardDescription className="mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最新のインサイト</h2>
          <Button variant="outline" size="sm">すべて表示</Button>
        </div>

        <div className="space-y-4">
          {mockInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {insight.timestamp}
                        </Badge>
                      </div>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI機能について
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            CONEROVAのAI機能は、Google Gemini APIを活用して、あなたのパフォーマンスデータを深く分析します。
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>リアルタイムでデータを分析し、改善提案を提供</li>
            <li>自然言語での質問に対応するAIチャット</li>
            <li>週次・月次レポートの自動生成</li>
            <li>チームメイトとの比較分析</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
