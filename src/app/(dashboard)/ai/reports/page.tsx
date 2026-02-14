'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Sparkles, TrendingUp, Eye } from 'lucide-react';

export default function AIReportsPage() {
  const reports = [
    {
      id: 1,
      title: '2月第2週 週次パフォーマンスレポート',
      type: 'weekly',
      date: '2024-02-11',
      status: 'ready',
      highlights: [
        '垂直跳び: 平均65cm (+3.2cm)',
        'シャトルラン: 平均85回 (+5回)',
        '参加セッション: 3回'
      ]
    },
    {
      id: 2,
      title: '2月第1週 週次パフォーマンスレポート',
      type: 'weekly',
      date: '2024-02-04',
      status: 'ready',
      highlights: [
        '垂直跳び: 平均62cm (+1.5cm)',
        'スプリント: 平均3.2秒 (-0.1秒)',
        '参加セッション: 2回'
      ]
    },
    {
      id: 3,
      title: '1月 月次総合レポート',
      type: 'monthly',
      date: '2024-02-01',
      status: 'ready',
      highlights: [
        '総セッション参加: 8回',
        '自己ベスト更新: 4項目',
        '新規バッジ獲得: 2個'
      ]
    },
    {
      id: 4,
      title: '1月第4週 週次パフォーマンスレポート',
      type: 'weekly',
      date: '2024-01-28',
      status: 'ready',
      highlights: [
        '垂直跳び: 平均60cm (+2.0cm)',
        'プランク: 平均120秒 (+15秒)',
        '参加セッション: 2回'
      ]
    },
    {
      id: 5,
      title: '2月第3週 週次パフォーマンスレポート',
      type: 'weekly',
      date: '2024-02-18',
      status: 'pending',
      highlights: []
    }
  ];

  const getTypeBadge = (type: string) => {
    if (type === 'weekly') {
      return <Badge variant="default">週次</Badge>;
    }
    return <Badge variant="secondary">月次</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ready') {
      return <Badge variant="outline" className="border-green-500 text-green-700">生成済み</Badge>;
    }
    return <Badge variant="outline" className="border-orange-500 text-orange-700">生成中</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AIレポート</h1>
        <p className="text-muted-foreground mt-2">
          AIが自動生成したパフォーマンスレポート
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総レポート数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'ready').length}</div>
            <p className="text-xs text-muted-foreground">生成済みレポート</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月のレポート</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.date.startsWith('2024-02')).length}
            </div>
            <p className="text-xs text-muted-foreground">2月生成分</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">次回生成</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2月18日</div>
            <p className="text-xs text-muted-foreground">週次レポート予定</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            自動レポート生成について
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            CONEROVAは毎週月曜日と毎月1日に自動的にパフォーマンスレポートを生成します。
            レポートには以下の内容が含まれます：
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>期間内の測定データサマリー</li>
            <li>前期間との比較分析</li>
            <li>パフォーマンストレンド</li>
            <li>改善提案とアドバイス</li>
            <li>達成した目標やバッジ</li>
          </ul>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">レポート一覧</h2>
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className={report.status === 'pending' ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      {getTypeBadge(report.type)}
                      {getStatusBadge(report.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {report.date}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {report.status === 'ready' && (
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      ハイライト
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {report.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      レポートを開く
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              )}
              {report.status === 'pending' && (
                <CardContent>
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    レポートは期間終了後に自動生成されます
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>レポートのカスタマイズ</CardTitle>
          <CardDescription>レポート生成の設定を変更します（近日公開予定）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium mb-1">週次レポートの曜日</p>
            <p className="text-xs text-muted-foreground">毎週月曜日（変更不可）</p>
          </div>
          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium mb-1">含める項目</p>
            <p className="text-xs text-muted-foreground">すべての測定データ（カスタマイズ機能は開発中）</p>
          </div>
          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium mb-1">共有設定</p>
            <p className="text-xs text-muted-foreground">自分のみ閲覧可（共有機能は開発中）</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
