'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { User, Mail, Shield, Upload } from 'lucide-react';

export default function ProfileSettingsPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile update submitted');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">プロフィール設定</h1>
        <p className="text-muted-foreground mt-2">
          個人情報とプロフィールを管理します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>アカウントの基本情報を編集します</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-muted">
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              </Avatar>
              <div className="space-y-2">
                <Label>プロフィール画像</Label>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  画像をアップロード
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG、PNG形式。最大5MB
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">表示名</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="山田 太郎"
                  defaultValue="山田 太郎"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    defaultValue="yamada@example.com"
                    disabled
                    className="pr-10"
                  />
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  メールアドレスは変更できません
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">選手情報</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="playerName">選手名</Label>
                  <Input
                    id="playerName"
                    type="text"
                    placeholder="山田 太郎"
                    defaultValue="山田 太郎"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jerseyNumber">背番号</Label>
                  <Input
                    id="jerseyNumber"
                    type="number"
                    placeholder="23"
                    defaultValue="23"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">ポジション</Label>
                  <select
                    id="position"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">選択してください</option>
                    <option value="PG">ポイントガード (PG)</option>
                    <option value="SG">シューティングガード (SG)</option>
                    <option value="SF">スモールフォワード (SF)</option>
                    <option value="PF">パワーフォワード (PF)</option>
                    <option value="C">センター (C)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">身長 (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    defaultValue="175"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">体重 (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    defaultValue="70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">生年月日</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    defaultValue="2000-01-01"
                  />
                </div>
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

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="h-5 w-5" />
            プライバシーについて
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p>
            あなたの個人情報は安全に保護されています。プロフィール情報はチームメンバーと共有されますが、
            メールアドレスなどの機密情報は管理者のみが閲覧できます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
