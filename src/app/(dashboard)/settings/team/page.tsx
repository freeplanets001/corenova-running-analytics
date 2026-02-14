'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Calendar } from 'lucide-react';

export default function TeamSettingsPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Team settings update submitted');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">チーム設定</h1>
          <p className="text-muted-foreground mt-1">
            チームの基本情報を管理します（管理者のみ）
          </p>
        </div>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold">管理者専用ページ</p>
              <p className="mt-1">このページの設定は管理者のみが変更できます。変更はチーム全体に影響します。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>チーム情報</CardTitle>
          <CardDescription>チームの基本情報を編集します</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamName">チーム名</Label>
              <Input
                id="teamName"
                type="text"
                placeholder="例: 東京バスケットボールクラブ"
                defaultValue="東京バスケットボールクラブ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamCode">チームコード</Label>
              <div className="flex gap-2">
                <Input
                  id="teamCode"
                  type="text"
                  value="TBC2024"
                  disabled
                  className="flex-1"
                />
                <Badge variant="secondary" className="self-center">
                  固定
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                チームコードは変更できません。メンバー招待時に使用されます。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">チーム説明</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="チームの説明や目標を入力してください"
                defaultValue="2024年シーズンを戦う競技バスケットボールチーム"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="established">設立年</Label>
                <Input
                  id="established"
                  type="number"
                  placeholder="2020"
                  defaultValue="2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">拠点</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="東京都"
                  defaultValue="東京都渋谷区"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit">
                変更を保存
              </Button>
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>チーム統計</CardTitle>
          <CardDescription>現在のチーム状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">メンバー</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-muted-foreground">セッション数</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
              <Shield className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">管理者</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>危険な操作</CardTitle>
          <CardDescription>これらの操作は取り消すことができません</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border-2 border-red-200 bg-red-50">
            <div>
              <p className="font-medium text-red-900">チームデータをエクスポート</p>
              <p className="text-sm text-red-700 mt-1">すべてのデータをCSV形式でダウンロードします</p>
            </div>
            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              エクスポート
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border-2 border-red-200 bg-red-50">
            <div>
              <p className="font-medium text-red-900">チームを削除</p>
              <p className="text-sm text-red-700 mt-1">すべてのデータが完全に削除されます</p>
            </div>
            <Button variant="destructive" disabled>
              削除
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
