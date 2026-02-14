import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireRole, ApiError } from '@/lib/utils/permissions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getGeminiConfig(teamId: string) {
  // 1. Try env var first
  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenAI } = await import('@google/genai')
    return {
      ai: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    }
  }

  // 2. Try DB settings
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

async function getTeamContext(teamId: string) {
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, session_date, test_type_id, notes, location')
    .eq('team_id', teamId)
    .order('session_date', { ascending: false })
    .limit(10)

  const { data: testTypes } = await supabase
    .from('test_types')
    .select('id, name, unit, direction')
    .eq('team_id', teamId)

  const { data: players } = await supabase
    .from('team_members')
    .select('profile_id, role, profiles!team_members_profile_id_fkey(display_name, player_name)')
    .eq('team_id', teamId)

  const sessionIds = sessions?.map(s => s.id) || []
  let runs: { session_id: string; player_id: string; value: number; run_number: number }[] = []
  if (sessionIds.length > 0) {
    const { data } = await supabase
      .from('session_runs')
      .select('session_id, player_id, value, run_number')
      .in('session_id', sessionIds)
      .eq('is_valid', true)
    runs = data || []
  }

  const testTypeMap = new Map(testTypes?.map(t => [t.id, t]) || [])

  const sessionSummaries = (sessions || []).map(s => {
    const sessionRuns = runs.filter(r => r.session_id === s.id)
    const values = sessionRuns.map(r => r.value)
    const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 'N/A'
    const best = values.length > 0 ? Math.min(...values).toFixed(2) : 'N/A'
    const tt = testTypeMap.get(s.test_type_id)
    return `- ${s.session_date}: ${tt?.name || '不明'}（${tt?.unit || '秒'}）選手${new Set(sessionRuns.map(r => r.player_id)).size}名, ${sessionRuns.length}本, 平均${avg}, ベスト${best}`
  })

  const playerNames = (players || []).map(p => {
    const profile = p.profiles as unknown as { display_name: string; player_name: string | null }
    return profile?.player_name || profile?.display_name || '不明'
  })

  return `## チームデータコンテキスト

### 登録選手 (${playerNames.length}名)
${playerNames.join(', ') || 'なし'}

### 測定種目
${(testTypes || []).map(t => `- ${t.name}（${t.unit}、${t.direction === 'decrease' ? '低い方が良い' : '高い方が良い'}）`).join('\n') || 'なし'}

### 直近のセッション
${sessionSummaries.join('\n') || 'セッションデータなし'}`
}

export async function POST(request: NextRequest) {
  try {
    const { userId, teamId } = await requireRole('admin', 'player')

    const body = await request.json()
    const { message, conversationId } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'メッセージが必要です' }, { status: 400 })
    }

    const gemini = await getGeminiConfig(teamId)
    if (!gemini) {
      return NextResponse.json({
        error: 'AI機能が設定されていません。管理者がAI設定ページでAPIキーを設定するか、環境変数GEMINI_API_KEYを設定してください。',
      }, { status: 400 })
    }

    // Get or create conversation (skip if tables don't exist)
    let convId = conversationId
    try {
      if (!convId) {
        const { data: conv } = await supabase
          .from('ai_conversations')
          .insert({ team_id: teamId, user_id: userId, title: message.slice(0, 50) })
          .select('id')
          .single()
        convId = conv?.id
      }

      if (convId) {
        await supabase.from('ai_chat_messages').insert({
          conversation_id: convId,
          role: 'user',
          content: message,
        })
      }
    } catch {
      // ai_conversations/ai_chat_messages tables may not exist yet
      convId = null
    }

    // Get previous messages for context
    let chatHistory: { role: string; content: string }[] = []
    if (convId) {
      try {
        const { data: prevMessages } = await supabase
          .from('ai_chat_messages')
          .select('role, content')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true })
          .limit(20)
        chatHistory = (prevMessages || []).filter(m => m.role !== 'system')
      } catch {
        // ignore
      }
    }

    const teamContext = await getTeamContext(teamId)

    const systemPrompt = `あなたはCORENOVAフィジカル分析アプリのAIアシスタントです。
バレーボールチームのフィジカルセッション（走行タイム測定等）データを分析し、
選手やコーチに有益なアドバイスを提供します。

以下のルール:
- 日本語で回答してください
- データに基づいた具体的なアドバイスを提供してください
- 数値は適切に丸めてください
- マークダウン形式で回答してください
- 選手の名前は実際のデータに含まれるものだけ使ってください
- データがない場合は、推測せず「データがまだ不足しています」と伝えてください

${teamContext}`

    const contents = [
      { role: 'user' as const, parts: [{ text: systemPrompt + '\n\n以上がシステム設定です。これからのユーザーの質問に回答してください。' }] },
      { role: 'model' as const, parts: [{ text: 'はい、CORENOVAのAIアシスタントとして、チームのランニングデータに基づいてお答えします。何でもお聞きください。' }] },
    ]

    for (const msg of chatHistory.slice(0, -1)) {
      contents.push({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }],
      })
    }

    contents.push({ role: 'user' as const, parts: [{ text: message }] })

    const response = await gemini.ai.models.generateContent({
      model: gemini.model,
      contents,
    })

    const aiResponse = response.text || 'すみません、回答を生成できませんでした。'

    // Save AI response
    if (convId) {
      try {
        await supabase.from('ai_chat_messages').insert({
          conversation_id: convId,
          role: 'assistant',
          content: aiResponse,
          tokens_used: response.usageMetadata?.totalTokenCount || null,
        })
      } catch {
        // ignore save errors
      }
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: convId,
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('AI Chat error:', error)
    const errMsg = error instanceof Error ? error.message : 'AI応答の生成中にエラーが発生しました'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
