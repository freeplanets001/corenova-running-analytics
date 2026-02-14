'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">通知</h1>
        <p className="text-muted-foreground mt-2">
          チームの活動や達成に関する通知
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
          <p className="text-lg font-medium">通知はありません</p>
          <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
            新しいセッション記録、バッジ獲得、目標達成時に通知が届きます。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
