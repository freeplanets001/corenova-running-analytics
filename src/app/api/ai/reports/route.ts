import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireRole, ApiError } from '@/lib/utils/permissions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getGeminiConfig(teamId: string) {
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenAI } = await import('@google/genai')
    return {
      ai: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    }
  }

  try {
    const { data: settings } = await supabase
      .from('api_settings')
      .select('api_key_encrypted, model_name')
      .eq('team_id', teamId)
      .eq('provider', 'gemini')
      .eq('is_configured', true)
      .single()

    if (settings?.api_key_encrypted) {
      const { GoogleGenAI } = await import('@google/genai')
      return {
        ai: new GoogleGenAI({ apiKey: settings.api_key_encrypted }),
        model: settings.model_name || 'gemini-2.0-flash',
      }
    }
  } catch {
    // api_settings table may not exist
  }
  return null
}

async function getTeamId(userId: string): Promise<string | null> {
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('profile_id', userId)
    .limit(1)
    .single()
  if (membership) return membership.team_id

  const { data: teams } = await supabase.from('teams').select('id').limit(1)
  return teams?.[0]?.id || null
}

// GET: Fetch generated reports
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ reports: [] })

    const teamId = await getTeamId(userId)
    if (!teamId) return NextResponse.json({ reports: [] })

    try {
      const { data: reports } = await supabase
        .from('ai_insights')
        .select('id, insight_type, title, content, summary, severity, created_at, is_read, model_used')
        .eq('team_id', teamId)
        .in('insight_type', ['weekly_report', 'monthly_report'])
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(20)

      return NextResponse.json({ reports: reports || [] })
    } catch {
      return NextResponse.json({ reports: [] })
    }
  } catch (error) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ reports: [] }, { status: 500 })
  }
}

// POST: Generate a new report (admin only)
export async function POST(request: NextRequest) {
  try {
    const { teamId } = await requireRole('admin')

    const body = await request.json()
    const { reportType } = body

    const gemini = await getGeminiConfig(teamId)
    if (!gemini) {
      return NextResponse.json({
        error: 'AI機能が設定されていません。管理者がAI設定ページでAPIキーを設定するか、環境変数GEMINI_API_KEYを設定してください。',
      }, { status: 400 })
    }

    // Determine date range
    const now = new Date()
    const isMonthly = reportType === 'monthly'
    const startDate = new Date(now)
    if (isMonthly) {
      startDate.setMonth(startDate.getMonth() - 1)
    } else {
      startDate.setDate(startDate.getDate() - 7)
    }
    const startDateStr = startDate.toISOString().split('T')[0]

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, session_date, test_type_id, notes')
      .eq('team_id', teamId)
      .gte('session_date', startDateStr)
      .order('session_date', { ascending: true })

    const { data: testTypes } = await supabase
      .from('test_types')
      .select('id, name, unit, direction')
      .eq('team_id', teamId)

    const sessionIds = sessions?.map(s => s.id) || []
    let runs: { session_id: string; player_id: string; value: number }[] = []
    if (sessionIds.length > 0) {
      const { data } = await supabase
        .from('session_runs')
        .select('session_id, player_id, value')
        .in('session_id', sessionIds)
        .eq('is_valid', true)
      runs = data || []
    }

    const { data: players } = await supabase
      .from('team_members')
      .select('profile_id, profiles!team_members_profile_id_fkey(display_name, player_name)')
      .eq('team_id', teamId)

    const testTypeMap = new Map(testTypes?.map(t => [t.id, t]) || [])
    const playerMap = new Map(
      (players || []).map(p => {
        const prof = p.profiles as unknown as { display_name: string; player_name: string | null }
        return [p.profile_id, prof?.player_name || prof?.display_name || '不明']
      })
    )

    const sessionSummaries = (sessions || []).map(s => {
      const sRuns = runs.filter(r => r.session_id === s.id)
      const tt = testTypeMap.get(s.test_type_id)
      const values = sRuns.map(r => r.value)

      const playerStats = new Map<string, number[]>()
      sRuns.forEach(r => {
        if (!playerStats.has(r.player_id)) playerStats.set(r.player_id, [])
        playerStats.get(r.player_id)!.push(r.value)
      })

      return {
        date: s.session_date,
        testType: tt?.name || '不明',
        unit: tt?.unit || '秒',
        playerCount: playerStats.size,
        runCount: sRuns.length,
        avg: values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 'N/A',
        best: values.length ? Math.min(...values).toFixed(2) : 'N/A',
        players: Array.from(playerStats.entries()).map(([pid, vals]) => ({
          name: playerMap.get(pid) || '不明',
          avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
          best: Math.min(...vals).toFixed(2),
          count: vals.length,
        })),
      }
    })

    const periodLabel = isMonthly ? '月次' : '週次'
    const dateRange = `${startDateStr} 〜 ${now.toISOString().split('T')[0]}`

    if (sessionSummaries.length === 0) {
      return NextResponse.json({
        error: `対象期間（${dateRange}）にセッションデータがありません。`,
      }, { status: 400 })
    }

    const prompt = `あなたはバスケットボールチームのランニング分析AIです。
以下のセッションデータを基に、${periodLabel}パフォーマンスレポートを作成してください。

対象期間: ${dateRange}
セッション数: ${sessionSummaries.length}

データ:
${JSON.stringify(sessionSummaries, null, 2)}

以下の形式でマークダウンのレポートを作成してください:

# ${periodLabel}パフォーマンスレポート
**対象期間:** ${dateRange}

## サマリー
（期間全体の概要を2-3文で）

## セッション別結果
（各セッションの結果をまとめる）

## 選手別分析
（主要な選手の成績を分析）

## トレンドと傾向
（改善・悪化の傾向を分析）

## 改善提案
（具体的なアドバイスを3つ程度）

ルール:
- 実データに基づいて分析してください
- 具体的な数値を含めてください
- ポジティブな点と改善点の両方を含めてください`

    const response = await gemini.ai.models.generateContent({ model: gemini.model, contents: prompt })
    const reportContent = response.text || 'レポートの生成に失敗しました。'

    const insightType = isMonthly ? 'monthly_report' : 'weekly_report'
    const reportTitle = `${periodLabel}パフォーマンスレポート（${dateRange}）`
    const reportSummary = `${sessionSummaries.length}セッション、${runs.length}本のデータに基づくレポート`

    // Try to save to DB
    let savedReport: { id: string; title: string; content: string; created_at: string; insight_type: string; summary: string | null } | null = null
    try {
      const { data: saved } = await supabase
        .from('ai_insights')
        .insert({
          team_id: teamId,
          insight_type: insightType,
          title: reportTitle,
          content: reportContent,
          summary: reportSummary,
          severity: 'info',
          model_used: gemini.model,
          prompt_tokens: response.usageMetadata?.promptTokenCount || null,
          completion_tokens: response.usageMetadata?.candidatesTokenCount || null,
        })
        .select('id, title, content, created_at, insight_type, summary')
        .single()
      savedReport = saved
    } catch {
      // ai_insights table may not exist
      savedReport = {
        id: `temp-${Date.now()}`,
        title: reportTitle,
        content: reportContent,
        created_at: new Date().toISOString(),
        insight_type: insightType,
        summary: reportSummary,
      }
    }

    return NextResponse.json({ report: savedReport })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Report generation error:', error)
    const errMsg = error instanceof Error ? error.message : 'レポート生成に失敗しました'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
