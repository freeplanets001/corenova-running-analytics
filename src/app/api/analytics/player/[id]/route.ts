import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: playerId } = await params

    // Fetch player profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, player_name, jersey_number, position')
      .eq('id', playerId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Fetch all runs for this player
    const { data: runs } = await supabase
      .from('session_runs')
      .select('session_id, run_number, value, is_valid')
      .eq('player_id', playerId)
      .eq('is_valid', true)
      .order('run_number')

    // Fetch sessions for date info
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, session_date, test_type_id, location')
      .order('session_date', { ascending: true })

    const { data: testTypes } = await supabase
      .from('test_types')
      .select('id, name, unit, direction')

    if (!runs || !sessions) {
      return NextResponse.json({ error: 'Data error' }, { status: 500 })
    }

    const testTypeMap = new Map(testTypes?.map(t => [t.id, t]) || [])
    const sessionMap = new Map(sessions.map(s => [s.id, s]))

    // Group runs by session
    const sessionGroups = new Map<string, Array<{ runNumber: number; value: number }>>()
    for (const r of runs) {
      if (!sessionGroups.has(r.session_id)) sessionGroups.set(r.session_id, [])
      sessionGroups.get(r.session_id)!.push({ runNumber: r.run_number, value: r.value })
    }

    // Build per-session history
    const history = [...sessionGroups.entries()]
      .map(([sid, playerRuns]) => {
        const session = sessionMap.get(sid)
        if (!session) return null
        const tt = testTypeMap.get(session.test_type_id)
        const values = playerRuns.map(r => r.value)
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const best = Math.min(...values)
        return {
          sessionId: sid,
          date: session.session_date,
          testType: tt?.name || '不明',
          unit: tt?.unit || '秒',
          location: session.location,
          runs: playerRuns.sort((a, b) => a.runNumber - b.runNumber),
          average: Math.round(avg * 10) / 10,
          best: Math.round(best * 10) / 10,
          runCount: playerRuns.length,
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime())

    // Overall stats
    const allValues = runs.map(r => r.value)
    const overallAvg = allValues.length > 0
      ? Math.round((allValues.reduce((a, b) => a + b, 0) / allValues.length) * 10) / 10
      : 0
    const personalBest = allValues.length > 0 ? Math.round(Math.min(...allValues) * 10) / 10 : 0
    const personalWorst = allValues.length > 0 ? Math.round(Math.max(...allValues) * 10) / 10 : 0

    // Improvement: compare first session avg to last session avg
    let improvement = 0
    if (history.length >= 2) {
      const firstAvg = history[0]!.average
      const lastAvg = history[history.length - 1]!.average
      improvement = Math.round((firstAvg - lastAvg) * 10) / 10
    }

    return NextResponse.json({
      playerId: profile.id,
      playerName: profile.player_name || profile.display_name,
      jerseyNumber: profile.jersey_number,
      position: profile.position,
      sessionCount: history.length,
      totalRuns: runs.length,
      overallAverage: overallAvg,
      personalBest,
      personalWorst,
      improvement,
      history,
    })
  } catch (error) {
    console.error('Player analytics API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
