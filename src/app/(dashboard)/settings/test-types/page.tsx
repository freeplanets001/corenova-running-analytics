'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';

export default function TestTypesSettingsPage() {
  const testTypes = [
    {
      id: 1,
      name: '垂直跳び',
      unit: 'cm',
      direction: 'higher',
      minValue: 0,
      maxValue: 100,
      category: '跳躍力',
      isDefault: true
    },
    {
      id: 2,
      name: '20mシャトルラン',
      unit: '回',
      direction: 'higher',
      minValue: 0,
      maxValue: 150,
      category: '持久力',
      isDefault: true
    },
    {
      id: 3,
      name: 'スプリント20m',
      unit: '秒',
      direction: 'lower',
      minValue: 0,
      maxValue: 10,
      category: 'スピード',
      isDefault: true
    },
    {
      id: 4,
      name: '体重',
      unit: 'kg',
      direction: 'neutral',
      minValue: 40,
      maxValue: 120,
      category: '体組成',
      isDefault: false
    },
    {
      id: 5,
      name: 'プランク',
      unit: '秒',
      direction: 'higher',
      minValue: 0,
      maxValue: 300,
      category: '体幹',
      isDefault: false
    }
  ];

  const getDirectionIcon = (direction: string) => {
    if (direction === 'higher') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (direction === 'lower') return <TrendingDown className="h-4 w-4 text-blue-600" />;
    return <span className="h-4 w-4">-</span>;
  };

  const getDirectionLabel = (direction: string) => {
    if (direction === 'higher') return '高い方が良い';
    if (direction === 'lower') return '低い方が良い';
    return '記録のみ';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">テストタイプ管理</h1>
          <p className="text-muted-foreground mt-1">
            測定項目とその設定を管理します（管理者のみ）
          </p>
        </div>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold">管理者専用ページ</p>
              <p className="mt-1">
                テストタイプの追加・編集・削除は管理者のみが行えます。
                デフォルトのテストタイプは削除できませんが、無効化することができます。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">登録済みテストタイプ</h2>
          <p className="text-sm text-muted-foreground mt-1">
            全{testTypes.length}件のテストタイプ
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規テストタイプ
        </Button>
      </div>

      <div className="grid gap-4">
        {testTypes.map((test) => (
          <Card key={test.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    {test.isDefault && (
                      <Badge variant="secondary">デフォルト</Badge>
                    )}
                    <Badge variant="outline">{test.category}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span>単位: {test.unit}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {getDirectionIcon(test.direction)}
                      {getDirectionLabel(test.direction)}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={test.isDefault}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">最小値</p>
                  <p className="font-medium">{test.minValue} {test.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">最大値</p>
                  <p className="font-medium">{test.maxValue} {test.unit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新規テストタイプの追加</CardTitle>
          <CardDescription>カスタムテストタイプを作成します</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="testName">テスト名</Label>
                <Input
                  id="testName"
                  type="text"
                  placeholder="例: 立ち幅跳び"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">カテゴリー</Label>
                <Input
                  id="category"
                  type="text"
                  placeholder="例: 跳躍力"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">単位</Label>
                <Input
                  id="unit"
                  type="text"
                  placeholder="例: cm, 秒, 回"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">評価方向</Label>
                <select
                  id="direction"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="higher">高い方が良い</option>
                  <option value="lower">低い方が良い</option>
                  <option value="neutral">記録のみ（良し悪しなし）</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minValue">最小値</Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  defaultValue="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxValue">最大値</Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                テストタイプを追加
              </Button>
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
