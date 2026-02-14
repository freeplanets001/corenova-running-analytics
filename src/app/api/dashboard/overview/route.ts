import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get team
    const { data: teams } = await supabase.from('teams').select('id, name').limit(1)
    const teamId = teams?.[0]?.id
    if (!teamId) return NextResponse.json({ error: 'No team found' }, { status: 404 })

    // Get sessions with test type
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, session_date, test_type_id, notes')
      .eq('team_id', teamId)
      .order('session_date', { ascending: false })

    // Get test type
    const { data: testTypes } = await supabase
      .from('test_types')
      .select('id, name, unit, direction')
      .limit(10)

    // Get all runs
    const { data: runs } = await supabase
      .from('session_runs')
      .select('session_id, player_id, run_number, value')
      .eq('is_valid', true)
      .order('session_id')

    // Get players
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, player_name')
      .not('player_name', 'is', null)

    if (!sessions || !runs || !profiles) {
      return NextResponse.json({ sessions: [], stats: null })
    }

    const playerMap = new Map(profiles.map(p => [p.id, p.player_name || p.display_name]))
    const testTypeMap = new Map(testTypes?.map(t => [t.id, t]) || [])

    // Calculate per-session averages
    const sessionStats = sessions.map(s => {
      const sessionRuns = runs.filter(r => r.session_id === s.id)
      const playerGroups = new Map<string, number[]>()
      for (const r of sessionRuns) {
        if (!playerGroups.has(r.player_id)) playerGroups.set(r.player_id, [])
        playerGroups.get(r.player_id)!.push(r.value)
      }

      const playerAverages = [...playerGroups.entries()].map(([pid, vals]) => ({
        playerId: pid,
        playerName: playerMap.get(pid) || '不明',
        average: vals.reduce((a, b) => a + b, 0) / vals.length,
        best: Math.min(...vals),
        runCount: vals.length,
      }))

      const allAverages = playerAverages.map(p => p.average)
      const teamAvg = allAverages.length > 0 ? allAverages.reduce((a, b) => a + b, 0) / allAverages.length : 0

      const tt = testTypeMap.get(s.test_type_id)

      return {
        id: s.id,
        date: s.session_date,
        testType: tt?.name || 'ランニングドリル',
        unit: tt?.unit || '秒',
        direction: tt?.direction || 'decrease',
        playerCount: playerGroups.size,
        teamAverage: Math.round(teamAvg * 10) / 10,
        teamMin: allAverages.length > 0 ? Math.round(Math.min(...allAverages) * 10) / 10 : 0,
        teamMax: allAverages.length > 0 ? Math.round(Math.max(...allAverages) * 10) / 10 : 0,
        bestPerformer: playerAverages.sort((a, b) => a.average - b.average)[0],
        players: playerAverages,
      }
    })

    // Overall stats
    const latestSession = sessionStats[0]
    const prevSession = sessionStats[1]
    const avgChange = latestSession && prevSession
      ? Math.round((latestSession.teamAverage - prevSession.teamAverage) * 10) / 10
      : 0

    // Player overall averages
    const playerOverall = new Map<string, number[]>()
    for (const s of sessionStats) {
      for (const p of s.players) {
        if (!playerOverall.has(p.playerId)) playerOverall.set(p.playerId, [])
        playerOverall.get(p.playerId)!.push(p.average)
      }
    }

    const playerRankings = [...playerOverall.entries()]
      .map(([pid, avgs]) => ({
        playerId: pid,
        playerName: playerMap.get(pid) || '不明',
        overallAverage: Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10,
        sessionsAttended: avgs.length,
      }))
      .sort((a, b) => a.overallAverage - b.overallAverage)

    // Attendance rate
    const totalSessions = sessionStats.length
    const avgAttendance = playerRankings.length > 0
      ? Math.round((playerRankings.reduce((sum, p) => sum + p.sessionsAttended, 0) / playerRankings.length / totalSessions) * 100)
      : 0

    return NextResponse.json({
      team: teams[0],
      stats: {
        sessionCount: sessionStats.length,
        playerCount: profiles.length,
        totalRuns: runs.length,
        latestSession: latestSession ? {
          date: latestSession.date,
          teamAverage: latestSession.teamAverage,
          playerCount: latestSession.playerCount,
          avgChange,
        } : null,
        bestPerformer: playerRankings[0] || null,
        attendanceRate: avgAttendance,
      },
      sessions: sessionStats.slice(0, 20),
      rankings: playerRankings.slice(0, 5),
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
