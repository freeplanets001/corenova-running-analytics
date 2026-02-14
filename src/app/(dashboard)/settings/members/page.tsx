'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Shield, UserPlus, Copy, User, Mail, MoreVertical, Search } from 'lucide-react';

export default function MembersSettingsPage() {
  const members = [
    {
      id: 1,
      name: '山田 太郎',
      email: 'yamada@example.com',
      role: 'admin',
      jerseyNumber: '23',
      position: 'PG',
      joinDate: '2024-01-01'
    },
    {
      id: 2,
      name: '佐藤 花子',
      email: 'sato@example.com',
      role: 'coach',
      jerseyNumber: '-',
      position: 'コーチ',
      joinDate: '2024-01-01'
    },
    {
      id: 3,
      name: '鈴木 一郎',
      email: 'suzuki@example.com',
      role: 'player',
      jerseyNumber: '10',
      position: 'SG',
      joinDate: '2024-01-15'
    },
    {
      id: 4,
      name: '高橋 美咲',
      email: 'takahashi@example.com',
      role: 'player',
      jerseyNumber: '7',
      position: 'SF',
      joinDate: '2024-01-15'
    },
    {
      id: 5,
      name: '田中 健太',
      email: 'tanaka@example.com',
      role: 'player',
      jerseyNumber: '15',
      position: 'PF',
      joinDate: '2024-02-01'
    }
  ];

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      admin: { label: '管理者', variant: 'default' },
      coach: { label: 'コーチ', variant: 'secondary' },
      player: { label: '選手', variant: 'outline' }
    };
    return roleMap[role] || { label: '選手', variant: 'outline' };
  };

  const handleCopyInviteLink = () => {
    const inviteLink = 'https://corenova.app/invite/TBC2024';
    navigator.clipboard.writeText(inviteLink);
    console.log('Invite link copied');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">メンバー管理</h1>
          <p className="text-muted-foreground mt-1">
            チームメンバーと役割を管理します（管理者のみ）
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総メンバー数</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">アクティブメンバー</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">選手</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.role === 'player').length}
            </div>
            <p className="text-xs text-muted-foreground">登録選手数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">スタッフ</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.role === 'admin' || m.role === 'coach').length}
            </div>
            <p className="text-xs text-muted-foreground">管理者・コーチ</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>招待リンク</CardTitle>
          <CardDescription>このリンクを共有して新しいメンバーを招待します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value="https://corenova.app/invite/TBC2024"
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={handleCopyInviteLink}>
              <Copy className="mr-2 h-4 w-4" />
              コピー
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            このリンクは有効期限がありません。リンクを持っている人は誰でもチームに参加できます。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>メンバー一覧</CardTitle>
              <CardDescription>チームメンバーの管理と役割の編集</CardDescription>
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              メンバーを追加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="メンバーを検索..."
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            {members.map((member) => {
              const roleBadge = getRoleBadge(member.role);
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border">
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        <Badge variant={roleBadge.variant}>
                          {roleBadge.label}
                        </Badge>
                        {member.jerseyNumber !== '-' && (
                          <Badge variant="outline">#{member.jerseyNumber}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </span>
                        {member.position !== 'コーチ' && (
                          <span>• {member.position}</span>
                        )}
                        <span>• 参加日: {member.joinDate}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold">権限について</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong>管理者:</strong> すべての機能にアクセスでき、メンバー管理や設定変更が可能</li>
                <li><strong>コーチ:</strong> データ閲覧・分析とセッション管理が可能</li>
                <li><strong>選手:</strong> 自分のデータ閲覧と目標管理が可能</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
