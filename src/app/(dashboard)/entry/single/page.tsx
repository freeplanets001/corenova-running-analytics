'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, Trash2, Calendar, User } from 'lucide-react';

export default function SingleEntryPage() {
  const [session, setSession] = useState('2024-01-15 朝練習');
  const [playerName, setPlayerName] = useState('');
  const [runs, setRuns] = useState<number[]>([0, 0, 0, 0, 0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddRun = () => {
    setRuns([...runs, 0]);
  };

  const handleRemoveRun = (index: number) => {
    if (runs.length > 1) {
      setRuns(runs.filter((_, i) => i !== index));
    }
  };

  const handleRunChange = (index: number, value: string) => {
    const newRuns = [...runs];
    newRuns[index] = parseFloat(value) || 0;
    setRuns(newRuns);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('データを保存しました');
  };

  const average = runs.length > 0 ? (runs.reduce((a, b) => a + b, 0) / runs.length).toFixed(2) : '0.00';

  return (
    <div className="container mx-auto max-w-2xl p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">個別データ入力</h1>
        <p className="text-gray-500 mt-2">選手の走行データを入力します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            セッション情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session">練習セッション</Label>
            <select
              id="session"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full h-12 rounded-md border border-gray-300 px-3 text-base"
            >
              <option value="2024-01-15 朝練習">2024-01-15 朝練習</option>
              <option value="2024-01-15 午後練習">2024-01-15 午後練習</option>
              <option value="2024-01-16 朝練習">2024-01-16 朝練習</option>
              <option value="2024-01-16 午後練習">2024-01-16 午後練習</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="player">選手名</Label>
            <div className="relative">
              <User className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
              <Input
                id="player"
                type="text"
                placeholder="選手名を入力"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>走行データ</CardTitle>
          <CardDescription>
            各ランの秒数を入力してください（タップしやすい大きめのボタン）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {runs.map((run, index) => (
            <div key={index} className="flex items-center gap-3">
              <Label className="min-w-20 text-base">ラン {index + 1}</Label>
              <Input
                type="number"
                step="0.01"
                value={run}
                onChange={(e) => handleRunChange(index, e.target.value)}
                className="h-14 text-lg"
                placeholder="0.00"
              />
              <span className="text-gray-500 min-w-8 text-base">秒</span>
              {runs.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRun(index)}
                  className="h-14 w-14"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddRun}
            className="w-full h-12 text-base"
          >
            <Plus className="mr-2 h-5 w-5" />
            ランを追加
          </Button>

          <div className="rounded-lg bg-blue-50 p-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-blue-900">平均タイム</span>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {average} 秒
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={!playerName || isSaving}
        className="w-full h-14 text-lg"
        size="lg"
      >
        <Save className="mr-2 h-5 w-5" />
        {isSaving ? '保存中...' : '保存'}
      </Button>
    </div>
  );
}
