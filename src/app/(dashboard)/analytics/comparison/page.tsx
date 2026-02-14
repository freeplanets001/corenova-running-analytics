'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Users, BarChart3, TrendingUp, Award, X } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  average: number;
  best: number;
  worst: number;
  improvement: number;
  sessions: number;
}

const availablePlayers: Player[] = [
  { id: 1, name: '田中 太郎', average: 28.6, best: 27.2, worst: 30.1, improvement: 11.4, sessions: 24 },
  { id: 2, name: '佐藤 花子', average: 27.5, best: 26.1, worst: 29.2, improvement: 15.2, sessions: 24 },
  { id: 3, name: '鈴木 一郎', average: 30.0, best: 28.5, worst: 32.1, improvement: 8.3, sessions: 22 },
  { id: 4, name: '山田 美咲', average: 28.8, best: 27.5, worst: 30.5, improvement: 10.9, sessions: 23 },
  { id: 5, name: '高橋 健太', average: 29.6, best: 28.2, worst: 31.4, improvement: 9.5, sessions: 24 },
  { id: 6, name: '伊藤 さくら', average: 27.8, best: 26.5, worst: 29.5, improvement: 13.8, sessions: 24 },
  { id: 7, name: '渡辺 大輔', average: 30.5, best: 29.1, worst: 32.8, improvement: 7.2, sessions: 21 },
  { id: 8, name: '中村 美穂', average: 28.5, best: 27.1, worst: 30.2, improvement: 12.1, sessions: 24 },
];

export default function ComparisonPage() {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([
    availablePlayers[0],
    availablePlayers[1],
  ]);

  const handlePlayerToggle = (player: Player) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);

    if (isSelected) {
      if (selectedPlayers.length > 2) {
        setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      }
    } else {
      if (selectedPlayers.length < 5) {
        setSelectedPlayers([...selectedPlayers, player]);
      }
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    if (selectedPlayers.length > 2) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
    }
  };

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">選手比較</h1>
        <p className="text-gray-500 mt-2">複数の選手のパフォーマンスを比較分析</p>
      </div>

      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            選手選択
          </CardTitle>
          <CardDescription>
            比較する選手を選択してください（2〜5名）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">
              {selectedPlayers.length}名選択中
            </Badge>
            <span className="text-sm text-gray-500">
              最大5名まで選択可能
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availablePlayers.map((player) => {
              const isSelected = selectedPlayers.some(p => p.id === player.id);
              const canSelect = selectedPlayers.length < 5;

              return (
                <Button
                  key={player.id}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => handlePlayerToggle(player)}
                  disabled={!isSelected && !canSelect}
                  className="h-auto py-3 flex flex-col items-start"
                >
                  <span className="font-medium">{player.name}</span>
                  <span className="text-xs opacity-75">平均 {player.average}秒</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Players */}
      <Card>
        <CardHeader>
          <CardTitle>比較対象選手</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map((player, index) => (
              <Badge
                key={player.id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-2 text-base"
              >
                <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                {player.name}
                {selectedPlayers.length > 2 && (
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            パフォーマンス比較グラフ
          </CardTitle>
          <CardDescription>
            選手ごとの平均タイム、ベストタイム、改善率の比較
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder Chart */}
          <div className="h-96 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <BarChart3 className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg font-medium">比較チャートエリア</p>
              <p className="text-sm mt-2">選手ごとのパフォーマンス指標を可視化</p>
            </div>
          </div>

          {/* Simple Bar Comparison */}
          <div className="mt-6 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">平均タイム比較</Label>
              {selectedPlayers.map((player, index) => {
                const maxAvg = Math.max(...selectedPlayers.map(p => p.average));
                const percentage = (player.average / maxAvg) * 100;

                return (
                  <div key={player.id} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{player.name}</span>
                      <span className="text-sm font-bold">{player.average}秒</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className={`h-6 rounded-full ${colors[index]} flex items-center justify-end pr-2`}
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {player.average}秒
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>統計比較表</CardTitle>
          <CardDescription>
            詳細な統計データの比較
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold">
                    項目
                  </th>
                  {selectedPlayers.map((player, index) => (
                    <th
                      key={player.id}
                      className="border border-gray-300 p-3 text-center font-semibold"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                        {player.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium">
                    平均タイム
                  </td>
                  {selectedPlayers.map((player) => (
                    <td key={player.id} className="border border-gray-300 p-3 text-center">
                      {player.average}秒
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium">
                    ベストタイム
                  </td>
                  {selectedPlayers.map((player) => {
                    const isBest = player.best === Math.min(...selectedPlayers.map(p => p.best));
                    return (
                      <td
                        key={player.id}
                        className={`border border-gray-300 p-3 text-center ${
                          isBest ? 'bg-green-50 font-bold' : ''
                        }`}
                      >
                        {player.best}秒
                        {isBest && <Award className="inline-block ml-1 h-4 w-4 text-yellow-600" />}
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium">
                    ワーストタイム
                  </td>
                  {selectedPlayers.map((player) => (
                    <td key={player.id} className="border border-gray-300 p-3 text-center">
                      {player.worst}秒
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium">
                    改善率
                  </td>
                  {selectedPlayers.map((player) => {
                    const isHighest = player.improvement === Math.max(...selectedPlayers.map(p => p.improvement));
                    return (
                      <td
                        key={player.id}
                        className={`border border-gray-300 p-3 text-center ${
                          isHighest ? 'bg-blue-50 font-bold' : ''
                        }`}
                      >
                        <span className="text-green-600">+{player.improvement}%</span>
                        {isHighest && <TrendingUp className="inline-block ml-1 h-4 w-4 text-green-600" />}
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium">
                    参加セッション数
                  </td>
                  {selectedPlayers.map((player) => (
                    <td key={player.id} className="border border-gray-300 p-3 text-center">
                      {player.sessions}回
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium">
                    タイム幅
                  </td>
                  {selectedPlayers.map((player) => (
                    <td key={player.id} className="border border-gray-300 p-3 text-center">
                      {(player.worst - player.best).toFixed(1)}秒
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>分析結果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">最速選手</p>
              <p className="text-blue-800">
                {selectedPlayers.reduce((prev, current) =>
                  prev.average < current.average ? prev : current
                ).name} - 平均 {Math.min(...selectedPlayers.map(p => p.average))}秒
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-1">最高改善率</p>
              <p className="text-green-800">
                {selectedPlayers.reduce((prev, current) =>
                  prev.improvement > current.improvement ? prev : current
                ).name} - +{Math.max(...selectedPlayers.map(p => p.improvement))}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-1">安定性</p>
              <p className="text-purple-800">
                {selectedPlayers.reduce((prev, current) =>
                  (prev.worst - prev.best) < (current.worst - current.best) ? prev : current
                ).name} - タイム幅 {Math.min(...selectedPlayers.map(p => p.worst - p.best)).toFixed(1)}秒
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
