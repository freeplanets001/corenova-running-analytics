'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Flame, Star, Zap, Shield, Trophy } from 'lucide-react'

const BADGES = [
  { id: 'speed-demon', name: 'スピードデーモン', description: 'チーム内最速タイムを記録', icon: Zap, color: 'text-yellow-500' },
  { id: 'iron-will', name: '鉄の意志', description: '10セッション連続参加', icon: Shield, color: 'text-blue-500' },
  { id: 'rising-star', name: '成長の星', description: '3セッション連続で改善', icon: Star, color: 'text-green-500' },
  { id: 'perfect-attendance', name: '皆勤賞', description: '全セッションに参加', icon: Award, color: 'text-purple-500' },
  { id: 'consistency-king', name: '安定王', description: '標準偏差が0.5秒以下', icon: Trophy, color: 'text-orange-500' },
  { id: 'fire-streak', name: '連勝記録', description: '5回連続でチーム平均を上回る', icon: Flame, color: 'text-red-500' },
]

export default function GamificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          ゲーミフィケーション
        </h1>
        <p className="text-muted-foreground mt-2">
          バッジ、ストリーク、チャレンジでモチベーションを高めましょう
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">獲得可能なバッジ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BADGES.map(badge => {
              const Icon = badge.icon
              return (
                <div key={badge.id} className="rounded-lg border p-4 opacity-50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-muted ${badge.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium">{badge.name}</div>
                      <Badge variant="outline" className="text-xs">未獲得</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          ゲーミフィケーション機能はデータの蓄積とともに自動的に有効になります。
          セッションに参加してバッジを獲得しましょう！
        </p>
      </Card>
    </div>
  )
}
