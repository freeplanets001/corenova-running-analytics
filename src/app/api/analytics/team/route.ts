import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: teams } = await supabase.from('teams').select('id').limit(1)
    const teamId = teams?.[0]?.id
    if (!teamId) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

    // Fetch sessions with test types
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, session_date, test_type_id, is_locked')
      .eq('team_id', teamId)
      .order('session_date', { ascending: true })

    const { data: testTypes } = await supabase
      .from('test_types')
      .select('id, name, unit, direction')

    const { data: runs } = await supabase
      .from('session_runs')
      .select('session_id, player_id, value, run_number')
      .eq('is_valid', true)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, player_name')
      .not('player_name', 'is', null)

    if (!sessions || !runs) {
      return NextResponse.json({ error: 'Data error' }, { status: 500 })
    }

    const testTypeMap = new Map(testTypes?.map(t => [t.id, t]) || [])
    const playerMap = new Map(profiles?.map(p => [p.id, p.player_name || p.display_name]) || [])

    // Build trend data: for each session, calculate team average
    const trendData = sessions.map(s => {
      const sessionRuns = runs.filter(r => r.session_id === s.id)
      const values = sessionRuns.map(r => r.value)
      const avg = values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0
      const best = values.length > 0 ? Math.round(Math.min(...values) * 10) / 10 : 0
      const playerIds = new Set(sessionRuns.map(r => r.player_id))
      const tt = testTypeMap.get(s.test_type_id)

      return {
        sessionId: s.id,
        date: s.session_date,
        testType: tt?.name || '不明',
        unit: tt?.unit || '秒',
        average: avg,
        best,
        playerCount: playerIds.size,
      }
    })

    // Overall stats
    const allValues = runs.map(r => r.value)
    const overallAvg = allValues.length > 0
      ? Math.round((allValues.reduce((a, b) => a + b, 0) / allValues.length) * 10) / 10
      : 0
    const overallBest = allValues.length > 0 ? Math.round(Math.min(...allValues) * 10) / 10 : 0

    // Player rankings (by average across all sessions)
    const playerTotals = new Map<string, { total: number; count: number }>()
    for (const r of runs) {
      const existing = playerTotals.get(r.player_id) || { total: 0, count: 0 }
      existing.total += r.value
      existing.count += 1
      playerTotals.set(r.player_id, existing)
    }

    const playerRankings = [...playerTotals.entries()]
      .map(([pid, stats]) => ({
        playerId: pid,
        playerName: playerMap.get(pid) || '不明',
        average: Math.round((stats.total / stats.count) * 10) / 10,
        runCount: stats.count,
      }))
      .sort((a, b) => a.average - b.average)
      .slice(0, 10)
      .map((p, i) => ({ ...p, rank: i + 1 }))

    return NextResponse.json({
      teamId,
      sessionCount: sessions.length,
      totalRuns: runs.length,
      totalPlayers: playerTotals.size,
      overallAverage: overallAvg,
      overallBest,
      trend: trendData,
      topPlayers: playerRankings,
    })
  } catch (error) {
    console.error('Team analytics API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
