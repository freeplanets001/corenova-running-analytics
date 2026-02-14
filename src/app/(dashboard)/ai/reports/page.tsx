'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'

interface Report {
  id: string
  insight_type: string
  title: string
  content: string
  summary: string | null
  created_at: string
  model_used: string | null
}

export default function AIReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingWeekly, setGeneratingWeekly] = useState(false)
  const [generatingMonthly, setGeneratingMonthly] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchReports()
  }, [user])

  const fetchReports = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/ai/reports?userId=${user.id}`)
      const data = await res.json()
      setReports(data.reports || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (type: 'weekly' | 'monthly') => {
    if (!user) return
    const setter = type === 'weekly' ? setGeneratingWeekly : setGeneratingMonthly
    setter(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, reportType: type }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'レポート生成に失敗しました')
        return
      }

      toast.success(`${type === 'weekly' ? '週次' : '月次'}レポートを生成しました`)
      fetchReports()
      if (data.report?.id) setExpandedId(data.report.id)
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setter(false)
    }
  }

  const getTypeBadge = (type: string) => {
    if (type === 'weekly_report') {
      return <Badge variant="default">週次</Badge>
    }
    return <Badge variant="secondary">月次</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AIレポート</h1>
        <p className="text-muted-foreground mt-2">
          AIが自動生成したパフォーマンスレポート
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総レポート数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">生成済みレポート</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">週次レポート</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.insight_type === 'weekly_report').length}
            </div>
            <p className="text-xs text-muted-foreground">生成済み</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月次レポート</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.insight_type === 'monthly_report').length}
            </div>
            <p className="text-xs text-muted-foreground">生成済み</p>
          </CardContent>
        </Card>
      </div>

      {/* Generate buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => handleGenerate('weekly')}
          disabled={generatingWeekly || generatingMonthly}
        >
          {generatingWeekly ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />生成中...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" />週次レポートを生成</>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleGenerate('monthly')}
          disabled={generatingWeekly || generatingMonthly}
        >
          {generatingMonthly ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />生成中...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" />月次レポートを生成</>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Reports list */}
      <div>
        <h2 className="text-xl font-semibold mb-4">レポート一覧</h2>
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                レポートがまだありません。上のボタンからレポートを生成してください。
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ※ AI設定ページでGemini APIキーが設定されている必要があります
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const isExpanded = expandedId === report.id
              return (
                <Card key={report.id}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          {getTypeBadge(report.insight_type)}
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.created_at).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                        {report.summary && (
                          <p className="text-sm text-muted-foreground">{report.summary}</p>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                        {report.content}
                      </div>
                    </CardContent>
                  )}
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
            レポート生成について
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            レポートはチームのセッションデータに基づいてAIが自動生成します。
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>週次レポート: 過去7日間のデータを分析</li>
            <li>月次レポート: 過去1ヶ月のデータを分析</li>
            <li>選手別の成績比較・トレンド分析・改善提案を含みます</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
