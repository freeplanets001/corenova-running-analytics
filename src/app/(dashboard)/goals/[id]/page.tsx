'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  Calendar,
  TrendingUp,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock goal data
const getGoalData = (id: string) => ({
  id,
  title: 'チーム平均タイムを13秒台に',
  description: '全体の底上げを図り、チーム平均タイムを現在の13.8秒から13.5秒以下に改善する',
  scope: 'team',
  metric: '平均タイム',
  testType: '60m走',
  currentValue: 13.82,
  targetValue: 13.50,
  unit: '秒',
  targetDate: '2024-12-31',
  createdDate: '2024-10-01',
  progress: 72,
  status: 'in_progress',
  milestones: [
    { id: 1, title: 'チーム平均13.7秒達成', completed: true, date: '2024-10-15' },
    { id: 2, title: 'チーム平均13.6秒達成', completed: true, date: '2024-11-20' },
    { id: 3, title: 'チーム平均13.5秒達成', completed: false, date: null },
    { id: 4, title: 'ベストタイム更新者10名以上', completed: true, date: '2024-11-05' },
    { id: 5, title: '全員が14秒台前半を達成', completed: false, date: null },
  ],
  history: [
    { date: '2024-12-01', value: 13.82, event: '最新測定結果' },
    { date: '2024-11-20', value: 13.88, event: 'マイルストーン達成: 13.6秒台' },
    { date: '2024-11-01', value: 14.05, event: '月次測定' },
    { date: '2024-10-15', value: 14.15, event: 'マイルストーン達成: 13.7秒台' },
    { date: '2024-10-01', value: 14.30, event: '目標設定' },
  ],
  participants: Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    name: `選手 ${i + 1}`,
    contribution: Math.random() > 0.5 ? 'positive' : 'neutral',
    improvement: (Math.random() * 10 - 2).toFixed(1),
  })),
});

const ProgressRing = ({ progress }: { progress: number }) => {
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-600 transition-all duration-1000"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <div className="text-4xl font-bold">{progress}%</div>
        <div className="text-sm text-muted-foreground">達成率</div>
      </div>
    </div>
  );
};

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const goal = getGoalData(params.id);

  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const totalMilestones = goal.milestones.length;
  const daysRemaining = Math.floor(
    (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{goal.title}</h1>
              <Badge variant="default">進行中</Badge>
            </div>
            <p className="text-muted-foreground">{goal.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">目標値</span>
          </div>
          <div className="text-2xl font-bold">
            {goal.targetValue}{goal.unit}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">現在値</span>
          </div>
          <div className="text-2xl font-bold">
            {goal.currentValue}{goal.unit}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">残り日数</span>
          </div>
          <div className="text-2xl font-bold">{daysRemaining}日</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Award className="h-4 w-4" />
            <span className="text-sm">マイルストーン</span>
          </div>
          <div className="text-2xl font-bold">
            {completedMilestones}/{totalMilestones}
          </div>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center justify-center">
          <ProgressRing progress={goal.progress} />
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">目標まであと</div>
            <div className="text-2xl font-bold mt-1">
              {(goal.currentValue - goal.targetValue).toFixed(2)}{goal.unit}
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">マイルストーン</h2>
          <div className="space-y-3">
            {goal.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  milestone.completed ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-card'
                }`}
              >
                {milestone.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {milestone.title}
                  </div>
                  {milestone.completed && milestone.date && (
                    <div className="text-xs text-muted-foreground mt-1">
                      達成日: {milestone.date}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">履歴</TabsTrigger>
          <TabsTrigger value="participants">参加者</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">進捗履歴</h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {goal.history.map((entry, index) => (
                  <div key={index} className="flex gap-4 relative">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold z-10">
                      {index + 1}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{entry.event}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {entry.date}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg">
                          {entry.value}{goal.unit}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">参加選手 ({goal.participants.length}名)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {goal.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="font-medium">{participant.name}</div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        parseFloat(participant.improvement) > 0
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {parseFloat(participant.improvement) > 0 ? '+' : ''}
                      {participant.improvement}%
                    </span>
                    {participant.contribution === 'positive' && (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">目標設定詳細</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">範囲</div>
                  <div className="font-medium mt-1">チーム目標</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">評価指標</div>
                  <div className="font-medium mt-1">{goal.metric}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">測定種目</div>
                  <div className="font-medium mt-1">{goal.testType}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">作成日</div>
                  <div className="font-medium mt-1">{goal.createdDate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">目標期限</div>
                  <div className="font-medium mt-1">{goal.targetDate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">ステータス</div>
                  <Badge className="mt-1">進行中</Badge>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
