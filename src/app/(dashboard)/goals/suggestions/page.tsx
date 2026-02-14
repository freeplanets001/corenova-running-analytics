'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Target,
  TrendingUp,
  Users,
  User,
  CheckCircle2,
  X,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

// Mock AI-generated goal suggestions
const mockSuggestions = [
  {
    id: 1,
    title: 'チーム平均タイムを13.2秒以下に改善',
    scope: 'team',
    metric: '平均タイム',
    currentValue: 13.82,
    targetValue: 13.20,
    unit: '秒',
    targetDate: '2025-03-31',
    confidence: 85,
    reasoning: [
      '直近3ヶ月で平均0.4秒の改善が見られます',
      '現在のペースで継続すれば、3ヶ月以内に達成可能です',
      'チーム全体の標準偏差が減少傾向にあり、安定性が向上しています',
    ],
    expectedImpact: 'チーム全体の底上げとモチベーション向上',
    difficulty: 'medium',
  },
  {
    id: 2,
    title: '選手5の個人ベストを12.5秒以下に',
    scope: 'personal',
    metric: 'ベストタイム',
    currentValue: 12.89,
    targetValue: 12.50,
    unit: '秒',
    targetDate: '2025-02-28',
    confidence: 78,
    reasoning: [
      '選手5は直近5回の測定で継続的に改善しています',
      '加速フェーズ（0-20m）に強みがあり、さらなる向上の余地があります',
      '同じポジションの上位選手との差が縮まっています',
    ],
    expectedImpact: '個人のモチベーション向上とチームへの好影響',
    difficulty: 'medium',
    targetPlayer: '選手 5',
  },
  {
    id: 3,
    title: '新入団選手の平均タイムを14.0秒以下に',
    scope: 'group',
    metric: '平均タイム',
    currentValue: 14.65,
    targetValue: 14.00,
    unit: '秒',
    targetDate: '2025-04-30',
    confidence: 92,
    reasoning: [
      '新入団選手（6名）の改善率が他の選手より高い傾向にあります',
      '基礎トレーニングの効果が顕著に表れています',
      '目標達成により、チーム全体の平均タイムがさらに改善します',
    ],
    expectedImpact: '新入団選手の育成とチーム全体のレベルアップ',
    difficulty: 'easy',
    targetGroup: '新入団選手',
  },
  {
    id: 4,
    title: '測定の標準偏差を0.3秒以下に安定化',
    scope: 'team',
    metric: '安定性（標準偏差）',
    currentValue: 0.45,
    targetValue: 0.30,
    unit: '秒',
    targetDate: '2025-05-31',
    confidence: 70,
    reasoning: [
      'パフォーマンスのばらつきを減らすことで、チームの安定性が向上します',
      '直近の測定で標準偏差が0.05秒改善しています',
      '安定性向上により、試合でのパフォーマンスの予測性が高まります',
    ],
    expectedImpact: 'チーム全体の安定性向上と予測可能性の向上',
    difficulty: 'hard',
  },
  {
    id: 5,
    title: '出席率95%以上を維持',
    scope: 'team',
    metric: '出席率',
    currentValue: 89,
    targetValue: 95,
    unit: '%',
    targetDate: '2025-03-31',
    confidence: 88,
    reasoning: [
      '現在の出席率は89%で、改善の余地があります',
      '定期的な測定参加がパフォーマンス向上の鍵となります',
      '欠席が多い選手（3名）へのフォローアップが効果的です',
    ],
    expectedImpact: '継続的なデータ収集とチームの一体感向上',
    difficulty: 'easy',
  },
];

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const config = {
    easy: { label: '易', variant: 'default' as const, className: 'bg-green-500' },
    medium: { label: '中', variant: 'secondary' as const, className: 'bg-yellow-500' },
    hard: { label: '難', variant: 'destructive' as const, className: 'bg-red-500' },
  };

  const { label, variant, className } = config[difficulty as keyof typeof config] || config.medium;

  return (
    <Badge variant={variant} className={className}>
      難易度: {label}
    </Badge>
  );
};

const ScopeIcon = ({ scope }: { scope: string }) => {
  if (scope === 'personal') return <User className="h-4 w-4" />;
  if (scope === 'group') return <Users className="h-4 w-4" />;
  return <Users className="h-4 w-4" />;
};

export default function GoalSuggestionsPage() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleApprove = (id: number) => {
    console.log('Approved goal:', id);
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  const handleReject = (id: number) => {
    console.log('Rejected goal:', id);
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">AI目標提案</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            パフォーマンスデータに基づいて、AIが最適な目標を提案します
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          提案を更新
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">現在、提案できる目標はありません</p>
            <p className="text-sm mt-2">
              測定データが蓄積されると、新しい提案が表示されます
            </p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              提案を確認
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold">{suggestion.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <ScopeIcon scope={suggestion.scope} />
                        {suggestion.scope === 'team' && 'チーム'}
                        {suggestion.scope === 'personal' && '個人'}
                        {suggestion.scope === 'group' && 'グループ'}
                      </Badge>
                      <Badge variant="outline">{suggestion.metric}</Badge>
                      <DifficultyBadge difficulty={suggestion.difficulty} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">AI信頼度</div>
                    <div className="text-2xl font-bold text-primary">
                      {suggestion.confidence}%
                    </div>
                  </div>
                </div>

                {/* Target Info */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-accent rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">現在値</div>
                    <div className="text-lg font-semibold mt-1">
                      {suggestion.currentValue}{suggestion.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">目標値</div>
                    <div className="text-lg font-semibold mt-1 text-primary">
                      {suggestion.targetValue}{suggestion.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">期限</div>
                    <div className="text-lg font-semibold mt-1">
                      {suggestion.targetDate}
                    </div>
                  </div>
                </div>

                {/* Target Player/Group */}
                {(suggestion.targetPlayer || suggestion.targetGroup) && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">対象:</span>
                    <span className="font-medium">
                      {suggestion.targetPlayer || suggestion.targetGroup}
                    </span>
                  </div>
                )}

                {/* Reasoning */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">提案理由</span>
                  </div>
                  <ul className="space-y-2">
                    {suggestion.reasoning.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expected Impact */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold">期待される効果</span>
                  </div>
                  <p className="text-sm">{suggestion.expectedImpact}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(suggestion.id)}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    却下
                  </Button>
                  <Button
                    onClick={() => handleApprove(suggestion.id)}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    承認して作成
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">AI目標提案について</h3>
            <p className="text-sm text-muted-foreground">
              これらの目標は、過去の測定データ、改善トレンド、チーム全体の傾向を分析して自動生成されています。
              承認すると、目標が自動的に作成され、進捗追跡が開始されます。
              提案が適切でない場合は却下できます。
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
