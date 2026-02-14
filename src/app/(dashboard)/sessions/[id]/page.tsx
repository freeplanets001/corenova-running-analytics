'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  MapPin,
  Timer,
  Lock,
  Unlock,
  Download,
  Edit,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock session data
const getSessionData = (id: string) => ({
  id,
  date: '2024-12-15',
  testType: '60m走',
  location: 'メインコート',
  weather: '晴れ',
  temperature: '15°C',
  locked: false,
  totalParticipants: 18,
  averageTime: 13.82,
  bestTime: 12.45,
  worstTime: 15.23,
  results: Array.from({ length: 18 }, (_, i) => ({
    playerId: i + 1,
    playerName: `選手 ${i + 1}`,
    playerNumber: i + 1,
    position: ['PG', 'SG', 'SF', 'PF', 'C'][i % 5],
    runs: [
      (13.5 + Math.random() * 1.5).toFixed(2),
      (13.3 + Math.random() * 1.5).toFixed(2),
      (13.7 + Math.random() * 1.5).toFixed(2),
    ],
    average: (13.5 + Math.random() * 1.5).toFixed(2),
    best: (12.8 + Math.random() * 1.2).toFixed(2),
    rank: i + 1,
    previousAvg: (13.6 + Math.random() * 1.5).toFixed(2),
  })).sort((a, b) => parseFloat(a.best) - parseFloat(b.best)),
});

const TrendIndicator = ({ current, previous }: { current: string; previous: string }) => {
  const diff = parseFloat(current) - parseFloat(previous);

  if (diff < -0.1) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <TrendingUp className="h-4 w-4" />
        <span className="text-xs font-medium">改善</span>
      </div>
    );
  }

  if (diff > 0.1) {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <TrendingDown className="h-4 w-4" />
        <span className="text-xs font-medium">低下</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-gray-400">
      <Minus className="h-4 w-4" />
      <span className="text-xs font-medium">同等</span>
    </div>
  );
};

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const session = getSessionData(params.id);
  const [isLocked, setIsLocked] = useState(session.locked);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResults = session.results.filter(result =>
    result.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.playerNumber.toString().includes(searchQuery)
  );

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
  };

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
              <h1 className="text-3xl font-bold">測定セッション詳細</h1>
              {isLocked ? (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  ロック済み
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Unlock className="h-3 w-3" />
                  編集可能
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              測定ID: #{session.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            エクスポート
          </Button>
          <Button
            variant={isLocked ? 'outline' : 'default'}
            onClick={handleToggleLock}
            className="gap-2"
          >
            {isLocked ? (
              <>
                <Unlock className="h-4 w-4" />
                ロック解除
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                セッションをロック
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">セッション情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">測定日</div>
              <div className="font-medium">{session.date}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">測定種目</div>
              <div className="font-medium">{session.testType}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">場所</div>
              <div className="font-medium">{session.location}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">参加人数</div>
              <div className="font-medium">{session.totalParticipants}名</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">平均タイム</div>
          <div className="text-3xl font-bold">{session.averageTime}s</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">ベストタイム</div>
          <div className="text-3xl font-bold text-green-600">{session.bestTime}s</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-2">ワーストタイム</div>
          <div className="text-3xl font-bold text-red-600">{session.worstTime}s</div>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">測定結果</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="選手名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">順位</th>
                <th className="text-left p-3 font-semibold">選手名</th>
                <th className="text-left p-3 font-semibold">ポジション</th>
                <th className="text-center p-3 font-semibold">1回目</th>
                <th className="text-center p-3 font-semibold">2回目</th>
                <th className="text-center p-3 font-semibold">3回目</th>
                <th className="text-center p-3 font-semibold">平均</th>
                <th className="text-center p-3 font-semibold">ベスト</th>
                <th className="text-center p-3 font-semibold">前回比</th>
                {!isLocked && <th className="text-center p-3 font-semibold">操作</th>}
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, index) => (
                <tr
                  key={result.playerId}
                  className={`border-b hover:bg-accent transition-colors ${
                    index < 3 ? 'bg-accent/30' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {index === 0 ? (
                        <Badge className="bg-yellow-500">1</Badge>
                      ) : index === 1 ? (
                        <Badge className="bg-gray-400">2</Badge>
                      ) : index === 2 ? (
                        <Badge className="bg-orange-600">3</Badge>
                      ) : (
                        <span className="text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{result.playerName}</div>
                    <div className="text-sm text-muted-foreground">
                      #{result.playerNumber}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{result.position}</Badge>
                  </td>
                  <td className="p-3 text-center font-mono">{result.runs[0]}s</td>
                  <td className="p-3 text-center font-mono">{result.runs[1]}s</td>
                  <td className="p-3 text-center font-mono">{result.runs[2]}s</td>
                  <td className="p-3 text-center font-mono font-semibold">
                    {result.average}s
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-green-600">
                    {result.best}s
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      <TrendIndicator
                        current={result.average}
                        previous={result.previousAvg}
                      />
                    </div>
                  </td>
                  {!isLocked && (
                    <td className="p-3">
                      <div className="flex justify-center">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>検索条件に一致する選手が見つかりません</p>
          </div>
        )}
      </Card>

      {/* Lock Info */}
      {isLocked ? (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong>このセッションはロックされています。</strong>
              <p className="text-muted-foreground mt-1">
                データの編集や削除はできません。ロックを解除する場合は、管理者権限が必要です。
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Unlock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong>このセッションは編集可能です。</strong>
              <p className="text-muted-foreground mt-1">
                データの確認が完了したら、セッションをロックして保護することをお勧めします。
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
