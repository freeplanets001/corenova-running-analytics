import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params
    const body = await request.json()
    const { playerId, runs } = body

    if (!playerId || !runs || !Array.isArray(runs) || runs.length === 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Check session exists and is not locked
    const { data: session } = await supabase
      .from('sessions')
      .select('id, is_locked')
      .eq('id', sessionId)
      .single()

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    if (session.is_locked) return NextResponse.json({ error: 'Session is locked' }, { status: 403 })

    // Upsert runs
    const records = runs.map((r: { runNumber: number; value: number }) => ({
      session_id: sessionId,
      player_id: playerId,
      run_number: r.runNumber,
      value: r.value,
      is_valid: true,
      source: 'manual',
    }))

    const { error } = await supabase
      .from('session_runs')
      .upsert(records, { onConflict: 'session_id,player_id,run_number' })

    if (error) throw error
    return NextResponse.json({ success: true, count: records.length })
  } catch (error) {
    console.error('Save runs error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
