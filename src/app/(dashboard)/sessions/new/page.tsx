'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewSessionPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement Supabase integration
    console.log('Session creation submitted');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新規セッション作成</h1>
          <p className="text-muted-foreground mt-2">
            新しい測定セッションを作成します
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>セッション情報</CardTitle>
          <CardDescription>測定セッションの詳細を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">測定日</Label>
              <Input
                id="date"
                type="date"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testType">テストタイプ</Label>
              <select
                id="testType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">選択してください</option>
                <option value="vertical-jump">垂直跳び</option>
                <option value="shuttle-run">20mシャトルラン</option>
                <option value="sprint">スプリント測定</option>
                <option value="agility">アジリティテスト</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">場所</Label>
              <Input
                id="location"
                type="text"
                placeholder="例: 体育館A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <textarea
                id="notes"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="セッションに関するメモや注意事項"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                セッションを作成
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>管理者専用:</strong> この機能は管理者のみが利用できます。セッション作成後、メンバーにデータ入力を案内してください。
        </p>
      </div>
    </div>
  );
}
