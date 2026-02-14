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

// GET: Fetch existing insights
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ insights: [] })

    const teamId = await getTeamId(userId)
    if (!teamId) return NextResponse.json({ insights: [] })

    try {
      const { data: insights } = await supabase
        .from('ai_insights')
        .select('id, insight_type, title, content, summary, severity, created_at, is_read, is_pinned, session_id, player_id')
        .eq('team_id', teamId)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(20)

      return NextResponse.json({ insights: insights || [] })
    } catch {
      // ai_insights table may not exist
      return NextResponse.json({ insights: [] })
    }
  } catch (error) {
    console.error('Insights GET error:', error)
    return NextResponse.json({ insights: [] }, { status: 500 })
  }
}

// POST: Generate new insights using Gemini (admin only)
export async function POST(request: NextRequest) {
  try {
    const { teamId } = await requireRole('admin')

    const gemini = await getGeminiConfig(teamId)
    if (!gemini) {
      return NextResponse.json({
        error: 'AI機能が設定されていません。管理者がAI設定ページでAPIキーを設定するか、環境変数GEMINI_API_KEYを設定してください。',
      }, { status: 400 })
    }

    // Gather data
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, session_date, test_type_id')
      .eq('team_id', teamId)
      .order('session_date', { ascending: false })
      .limit(10)

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

    const sessionData = (sessions || []).map(s => {
      const sRuns = runs.filter(r => r.session_id === s.id)
      const values = sRuns.map(r => r.value)
      const tt = testTypeMap.get(s.test_type_id)
      const playerStats = new Map<string, number[]>()
      sRuns.forEach(r => {
        if (!playerStats.has(r.player_id)) playerStats.set(r.player_id, [])
        playerStats.get(r.player_id)!.push(r.value)
      })

      const playerSummary = Array.from(playerStats.entries()).map(([pid, vals]) => {
        const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
        return `${playerMap.get(pid) || '不明'}: 平均${avg}${tt?.unit || '秒'}`
      })

      return {
        date: s.session_date,
        testType: tt?.name || '不明',
        unit: tt?.unit || '秒',
        direction: tt?.direction || 'decrease',
        totalRuns: sRuns.length,
        avg: values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : null,
        best: values.length ? Math.min(...values).toFixed(2) : null,
        playerSummary,
      }
    })

    if (sessionData.length === 0) {
      return NextResponse.json({
        error: 'セッションデータがありません。データが入力されるとインサイトが生成されます。',
      }, { status: 400 })
    }

    const prompt = `あなたはバスケットボールチームのランニング分析AIです。
以下のセッションデータを分析し、3〜5個のインサイトをJSON配列で返してください。

データ:
${JSON.stringify(sessionData, null, 2)}

以下の形式のJSON配列を返してください。他のテキストは含めないでください:
[
  {
    "insight_type": "trend_analysis" | "recommendation" | "anomaly" | "session_summary",
    "title": "短いタイトル（30文字以内）",
    "content": "詳細な分析内容（100-200文字）",
    "summary": "一言まとめ（50文字以内）",
    "severity": "positive" | "info" | "warning"
  }
]

ルール:
- 実際のデータに基づいて分析してください
- 具体的な数値を含めてください
- 改善提案は実用的なものにしてください
- データが不足している場合はそれを指摘してください`

    const response = await gemini.ai.models.generateContent({ model: gemini.model, contents: prompt })
    const text = response.text || '[]'

    let insights: Array<{
      insight_type: string
      title: string
      content: string
      summary: string
      severity: string
    }> = []
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0])
      }
    } catch {
      console.error('Failed to parse AI insights response:', text)
      return NextResponse.json({ error: 'インサイトの解析に失敗しました', insights: [] }, { status: 500 })
    }

    // Try to save insights to DB
    const validTypes = ['session_summary', 'trend_analysis', 'anomaly', 'recommendation', 'weekly_report', 'monthly_report']
    const insightRows = insights
      .filter(i => validTypes.includes(i.insight_type))
      .map(i => ({
        team_id: teamId,
        insight_type: i.insight_type,
        title: i.title,
        content: i.content,
        summary: i.summary,
        severity: i.severity || 'info',
        model_used: gemini.model,
      }))

    let savedInsights = insights.map((i, idx) => ({
      id: `temp-${idx}`,
      ...i,
      created_at: new Date().toISOString(),
      is_read: false,
      is_pinned: false,
    }))

    if (insightRows.length > 0) {
      try {
        await supabase.from('ai_insights').insert(insightRows)

        const { data: allInsights } = await supabase
          .from('ai_insights')
          .select('id, insight_type, title, content, summary, severity, created_at, is_read, is_pinned')
          .eq('team_id', teamId)
          .eq('is_dismissed', false)
          .order('created_at', { ascending: false })
          .limit(20)

        if (allInsights) savedInsights = allInsights
      } catch {
        // ai_insights table may not exist, return the generated insights directly
      }
    }

    return NextResponse.json({ insights: savedInsights, generated: insightRows.length })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Insights POST error:', error)
    const errMsg = error instanceof Error ? error.message : 'インサイト生成に失敗しました'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
