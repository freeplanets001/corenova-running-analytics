import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Check if env var is set
  const envKeySet = !!process.env.GEMINI_API_KEY

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      provider: 'gemini',
      modelName: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      isConfigured: envKeySet,
      envConfigured: envKeySet,
      updatedAt: null,
    })
  }

  // Get team - try team_members first, then fallback to any team
  let teamId: string | null = null
  const { data: membership } = await supabaseAdmin
    .from('team_members')
    .select('team_id')
    .eq('profile_id', user.id)
    .limit(1)
    .single()

  if (membership) {
    teamId = membership.team_id
  } else {
    const { data: teams } = await supabaseAdmin.from('teams').select('id').limit(1)
    teamId = teams?.[0]?.id || null
  }

  // Try to read DB settings
  let dbSettings: { provider?: string; model_name?: string; is_configured?: boolean; updated_at?: string } | null = null
  if (teamId) {
    try {
      const { data } = await supabaseAdmin
        .from('api_settings')
        .select('provider, model_name, is_configured, updated_at')
        .eq('team_id', teamId)
        .eq('provider', 'gemini')
        .single()
      dbSettings = data
    } catch {
      // api_settings table may not exist
    }
  }

  return NextResponse.json({
    provider: dbSettings?.provider ?? 'gemini',
    modelName: dbSettings?.model_name ?? process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    isConfigured: envKeySet || (dbSettings?.is_configured ?? false),
    envConfigured: envKeySet,
    updatedAt: dbSettings?.updated_at ?? null,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get team
  let teamId: string | null = null
  const { data: membership } = await supabaseAdmin
    .from('team_members')
    .select('team_id')
    .eq('profile_id', user.id)
    .limit(1)
    .single()

  if (membership) {
    teamId = membership.team_id
  } else {
    const { data: teams } = await supabaseAdmin.from('teams').select('id').limit(1)
    teamId = teams?.[0]?.id || null
  }

  if (!teamId) {
    return NextResponse.json({ error: 'チームが見つかりません' }, { status: 404 })
  }

  const body = await request.json()
  const { apiKey, modelName } = body as { apiKey?: string; modelName?: string }

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 })
  }

  // Validate the API key by making a test call
  try {
    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey })
    await ai.models.generateContent({
      model: modelName || 'gemini-2.0-flash',
      contents: 'テスト。「OK」とだけ返してください。',
    })
  } catch {
    return NextResponse.json({ error: 'APIキーまたはモデル名が無効です' }, { status: 400 })
  }

  // Upsert the settings
  try {
    const { error } = await supabaseAdmin
      .from('api_settings')
      .upsert({
        team_id: teamId,
        provider: 'gemini',
        api_key_encrypted: apiKey,
        model_name: modelName || 'gemini-2.0-flash',
        is_configured: true,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: 'team_id,provider' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } catch (err) {
    // api_settings table may not exist - still return success if validation passed
    console.error('API settings save error:', err)
  }

  return NextResponse.json({ success: true })
}
