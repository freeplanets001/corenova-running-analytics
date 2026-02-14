'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, FileSpreadsheet, QrCode, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { hasPermission } from '@/lib/constants/roles';

export default function EntryPage() {
  const { role } = useAuth();

  const allEntryModes = [
    {
      id: 'individual',
      title: '個人入力',
      description: '1名分のデータを手動で入力します',
      icon: User,
      href: '/entry/single',
      color: 'text-blue-600'
    },
    {
      id: 'bulk',
      title: '一括入力',
      description: '複数名のデータをまとめて入力します',
      icon: Users,
      href: '/entry/bulk',
      color: 'text-green-600'
    },
    {
      id: 'excel',
      title: 'Excel取込',
      description: 'Excelファイルから一括でデータをインポートします',
      icon: FileSpreadsheet,
      href: '/entry/import',
      color: 'text-purple-600'
    },
    {
      id: 'qr',
      title: 'QRチェックイン',
      description: 'QRコードでの参加者チェックインとデータ入力',
      icon: QrCode,
      href: '/entry/qr',
      color: 'text-orange-600'
    }
  ];

  const entryModes = allEntryModes.filter(mode => {
    if (mode.id === 'bulk') return hasPermission(role, 'bulkEntry');
    if (mode.id === 'excel') return hasPermission(role, 'excelImport');
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">データ入力</h1>
        <p className="text-muted-foreground mt-2">
          測定データの入力方法を選択してください
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {entryModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link key={mode.id} href={mode.href}>
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${mode.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{mode.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardDescription className="mt-3">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>入力のヒント</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-2">
            <span className="font-semibold min-w-[100px]">個人入力:</span>
            <span className="text-muted-foreground">少人数の測定や、追加データの入力に最適です</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold min-w-[100px]">一括入力:</span>
            <span className="text-muted-foreground">チーム全体の測定データを効率的に入力できます</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold min-w-[100px]">Excel取込:</span>
            <span className="text-muted-foreground">既存のExcelデータを素早くインポートできます</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold min-w-[100px]">QRチェックイン:</span>
            <span className="text-muted-foreground">選手が自分のQRコードでチェックインし、データを入力します</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
