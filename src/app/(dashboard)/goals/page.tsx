'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Plus } from 'lucide-react'
import Link from 'next/link'
import { RoleGate } from '@/components/shared/role-gate'

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">目標管理</h1>
          <p className="text-muted-foreground mt-2">
            チームと個人の目標を設定・管理します
          </p>
        </div>
        <RoleGate allowedRoles={['admin', 'player']}>
          <Link href="/goals/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              目標を作成
            </Button>
          </Link>
        </RoleGate>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Target className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
          <p className="text-lg font-medium">目標が設定されていません</p>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
            「目標を作成」ボタンから、チーム全体や個人の目標を設定できます。
            AI機能が有効な場合、データに基づいた目標提案も利用できます。
          </p>
          <RoleGate allowedRoles={['admin', 'player']}>
            <Link href="/goals/new">
              <Button className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                最初の目標を設定する
              </Button>
            </Link>
          </RoleGate>
        </CardContent>
      </Card>
    </div>
  )
}
