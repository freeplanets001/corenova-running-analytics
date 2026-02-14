import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's team
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('profile_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { data: settings } = await supabase
    .from('api_settings')
    .select('provider, model_name, is_configured, updated_at')
    .eq('team_id', membership.team_id)
    .eq('provider', 'gemini')
    .single()

  return NextResponse.json({
    provider: settings?.provider ?? 'gemini',
    modelName: settings?.model_name ?? 'gemini-2.0-flash',
    isConfigured: settings?.is_configured ?? false,
    updatedAt: settings?.updated_at ?? null,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('profile_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
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
    return NextResponse.json({ error: 'Invalid API key or model name' }, { status: 400 })
  }

  // Upsert the settings
  const { error } = await supabase
    .from('api_settings')
    .upsert({
      team_id: membership.team_id,
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

  return NextResponse.json({ success: true })
}
