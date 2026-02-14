import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireRole, ApiError } from '@/lib/utils/permissions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: teams } = await supabase.from('teams').select('id').limit(1)
    const teamId = teams?.[0]?.id
    if (!teamId) return NextResponse.json({ sessions: [] })

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, session_date, test_type_id, target_run_count, location, notes, is_locked')
      .eq('team_id', teamId)
      .order('session_date', { ascending: false })

    const { data: testTypes } = await supabase
      .from('test_types')
      .select('id, name, unit')

    const { data: runs } = await supabase
      .from('session_runs')
      .select('session_id, player_id, value')
      .eq('is_valid', true)

    if (!sessions) return NextResponse.json({ sessions: [] })

    const testTypeMap = new Map(testTypes?.map(t => [t.id, t]) || [])

    const result = sessions.map(s => {
      const sessionRuns = runs?.filter(r => r.session_id === s.id) || []
      const players = new Set(sessionRuns.map(r => r.player_id))
      const values = sessionRuns.map(r => r.value)
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      const tt = testTypeMap.get(s.test_type_id)

      return {
        id: s.id,
        date: s.session_date,
        testType: tt?.name || 'ランニングドリル',
        unit: tt?.unit || '秒',
        playerCount: players.size,
        runCount: sessionRuns.length,
        teamAverage: Math.round(avg * 10) / 10,
        isLocked: s.is_locked,
        notes: s.notes,
        location: s.location,
      }
    })

    return NextResponse.json({ sessions: result })
  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json({ sessions: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { teamId } = await requireRole('admin')

    const body = await request.json()
    const { date, location, notes } = body

    const { data: testType } = await supabase
      .from('test_types')
      .select('id')
      .eq('team_id', teamId)
      .limit(1)
      .single()

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        team_id: teamId,
        test_type_id: testType?.id,
        session_date: date,
        location: location || null,
        notes: notes || null,
        is_locked: false,
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: session.id })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Create session error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
