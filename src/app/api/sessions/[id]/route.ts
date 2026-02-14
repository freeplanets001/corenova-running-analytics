import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: testType } = await supabase
      .from('test_types')
      .select('name, unit, direction')
      .eq('id', session.test_type_id)
      .single()

    const { data: runs } = await supabase
      .from('session_runs')
      .select('player_id, run_number, value, is_valid')
      .eq('session_id', id)
      .order('run_number')

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, player_name')
      .not('player_name', 'is', null)

    if (!runs || !profiles) return NextResponse.json({ error: 'Data error' }, { status: 500 })

    const playerMap = new Map(profiles.map(p => [p.id, p.player_name || p.display_name]))

    // Group by player
    const playerGroups = new Map<string, Array<{ runNumber: number; value: number }>>()
    for (const r of runs) {
      if (!r.is_valid) continue
      if (!playerGroups.has(r.player_id)) playerGroups.set(r.player_id, [])
      playerGroups.get(r.player_id)!.push({ runNumber: r.run_number, value: r.value })
    }

    const players = [...playerGroups.entries()].map(([pid, playerRuns]) => {
      const values = playerRuns.map(r => r.value)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const best = Math.min(...values)
      const worst = Math.max(...values)
      return {
        playerId: pid,
        playerName: playerMap.get(pid) || '不明',
        runs: playerRuns.sort((a, b) => a.runNumber - b.runNumber),
        average: Math.round(avg * 10) / 10,
        best: Math.round(best * 10) / 10,
        worst: Math.round(worst * 10) / 10,
        runCount: playerRuns.length,
      }
    }).sort((a, b) => a.average - b.average)

    // Add rank
    const playersWithRank = players.map((p, i) => ({ ...p, rank: i + 1 }))

    return NextResponse.json({
      id: session.id,
      date: session.session_date,
      testType: testType?.name || 'ランニングドリル',
      unit: testType?.unit || '秒',
      direction: testType?.direction || 'decrease',
      isLocked: session.is_locked,
      notes: session.notes,
      location: session.location,
      playerCount: playersWithRank.length,
      players: playersWithRank,
    })
  } catch (error) {
    console.error('Session detail API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
