'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, MessageCircle, FileText, TrendingUp, Lightbulb, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'

interface Insight {
  id: string
  insight_type: string
  title: string
  content: string
  summary: string | null
  severity: string
  created_at: string
  is_read: boolean
  is_pinned: boolean
}

const severityIcon: Record<string, typeof TrendingUp> = {
  positive: TrendingUp,
  info: Sparkles,
  warning: AlertCircle,
}

const aiFeatures = [
  {
    title: 'AIチャット',
    description: 'データについて質問し、AIから即座に回答を得られます',
    href: '/ai/chat',
    icon: MessageCircle,
    color: 'text-blue-600',
  },
  {
    title: 'AIレポート',
    description: '週次・月次のパフォーマンスレポートを自動生成します',
    href: '/ai/reports',
    icon: FileText,
    color: 'text-green-600',
  },
]

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'たった今'
  if (diffMin < 60) return `${diffMin}分前`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}時間前`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}日前`
  return date.toLocaleDateString('ja-JP')
}

export default function AIPage() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchInsights()
  }, [user])

  const fetchInsights = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/ai/insights?userId=${user.id}`)
      const data = await res.json()
      setInsights(data.insights || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!user) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'インサイト生成に失敗しました')
        return
      }
      setInsights(data.insights || [])
      toast.success(`${data.generated}件のインサイトを生成しました`)
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setGenerating(false)
    }
  }

  // Filter out reports from insights
  const displayInsights = insights.filter(i => i.insight_type !== 'weekly_report' && i.insight_type !== 'monthly_report')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AIインサイト</h1>
        <p className="text-muted-foreground mt-2">
          AIがあなたのパフォーマンスデータを分析し、有益なインサイトを提供します
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon
          return (
            <Link key={feature.title} href={feature.href}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardDescription className="mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最新のインサイト</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />生成中...</>
            ) : (
              <><RefreshCw className="mr-2 h-4 w-4" />新しいインサイトを生成</>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayInsights.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                インサイトがまだありません。「新しいインサイトを生成」ボタンをクリックしてAIに分析させましょう。
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ※ AI設定ページでGemini APIキーが設定されている必要があります
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayInsights.map((insight) => {
              const Icon = severityIcon[insight.severity] || Lightbulb
              return (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        insight.severity === 'positive' ? 'bg-green-100 text-green-600' :
                        insight.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                        'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{insight.title}</CardTitle>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {timeAgo(insight.created_at)}
                          </Badge>
                        </div>
                        <CardDescription className="whitespace-pre-wrap">{insight.content}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI機能について
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            CONEROVAのAI機能は、Google Gemini APIを活用して、パフォーマンスデータを深く分析します。
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>リアルタイムでデータを分析し、改善提案を提供</li>
            <li>自然言語での質問に対応するAIチャット</li>
            <li>週次・月次レポートの自動生成</li>
            <li>チームメイトとの比較分析</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
