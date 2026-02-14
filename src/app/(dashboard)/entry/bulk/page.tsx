'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Shield, Calendar } from 'lucide-react';

interface PlayerData {
  id: number;
  name: string;
  runs: number[];
}

export default function BulkEntryPage() {
  const [session, setSession] = useState('2024-01-15 朝練習');
  const [isSaving, setIsSaving] = useState(false);
  const [players, setPlayers] = useState<PlayerData[]>([
    { id: 1, name: '田中 太郎', runs: [28.5, 29.1, 28.8, 29.2, 28.6] },
    { id: 2, name: '佐藤 花子', runs: [27.8, 28.2, 27.9, 28.5, 27.7] },
    { id: 3, name: '鈴木 一郎', runs: [30.1, 29.8, 30.3, 29.9, 30.0] },
    { id: 4, name: '山田 美咲', runs: [28.9, 29.3, 28.7, 29.1, 28.8] },
    { id: 5, name: '高橋 健太', runs: [29.5, 29.7, 29.4, 29.8, 29.6] },
    { id: 6, name: '伊藤 さくら', runs: [27.5, 27.9, 27.6, 28.0, 27.8] },
    { id: 7, name: '渡辺 大輔', runs: [30.5, 30.2, 30.8, 30.4, 30.6] },
    { id: 8, name: '中村 美穂', runs: [28.3, 28.6, 28.4, 28.7, 28.5] },
  ]);

  const handleRunChange = (playerId: number, runIndex: number, value: string) => {
    setPlayers(players.map(player => {
      if (player.id === playerId) {
        const newRuns = [...player.runs];
        newRuns[runIndex] = parseFloat(value) || 0;
        return { ...player, runs: newRuns };
      }
      return player;
    }));
  };

  const calculateAverage = (runs: number[]) => {
    const sum = runs.reduce((a, b) => a + b, 0);
    return (sum / runs.length).toFixed(2);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('全データを保存しました');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">一括データ入力</h1>
            <Badge variant="destructive" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              管理者専用
            </Badge>
          </div>
          <p className="text-gray-500 mt-2">スプレッドシート形式で複数選手のデータを入力</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            セッション選択
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full max-w-md h-10 rounded-md border border-gray-300 px-3"
          >
            <option value="2024-01-15 朝練習">2024-01-15 朝練習</option>
            <option value="2024-01-15 午後練習">2024-01-15 午後練習</option>
            <option value="2024-01-16 朝練習">2024-01-16 朝練習</option>
            <option value="2024-01-16 午後練習">2024-01-16 午後練習</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>走行データ入力グリッド</CardTitle>
          <CardDescription>
            各セルをクリックして値を編集できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left font-semibold sticky left-0 bg-gray-100 z-10">
                    選手名
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-semibold min-w-24">
                    ラン 1
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-semibold min-w-24">
                    ラン 2
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-semibold min-w-24">
                    ラン 3
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-semibold min-w-24">
                    ラン 4
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-semibold min-w-24">
                    ラン 5
                  </th>
                  <th className="border border-gray-300 p-3 text-center font-semibold bg-blue-50 min-w-24">
                    平均
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium sticky left-0 bg-white">
                      {player.name}
                    </td>
                    {player.runs.map((run, index) => (
                      <td key={index} className="border border-gray-300 p-1">
                        <Input
                          type="number"
                          step="0.1"
                          value={run}
                          onChange={(e) => handleRunChange(player.id, index, e.target.value)}
                          className="w-full text-center h-10 border-0 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 p-3 text-center font-semibold bg-blue-50">
                      {calculateAverage(player.runs)} 秒
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 ヒント: Tabキーで次のセルに移動、Shift+Tabで前のセルに戻ります
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="min-w-40">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? '保存中...' : 'すべて保存'}
        </Button>
      </div>
    </div>
  );
}
