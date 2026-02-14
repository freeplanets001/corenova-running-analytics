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
    if (!teamId) return NextResponse.json({ players: [] })

    // Fetch team members
    const { data: members } = await supabase
      .from('team_members')
      .select('user_id, role')
      .eq('team_id', teamId)

    if (!members || members.length === 0) {
      return NextResponse.json({ players: [] })
    }

    const memberIds = members.map(m => m.user_id)

    // Fetch profiles for team members
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, player_name, jersey_number, position, avatar_url')
      .in('id', memberIds)

    if (!profiles) return NextResponse.json({ players: [] })

    // Fetch all valid runs for these players
    const { data: runs } = await supabase
      .from('session_runs')
      .select('player_id, session_id, value')
      .eq('is_valid', true)
      .in('player_id', memberIds)

    // Calculate stats per player
    const playerStats = new Map<string, { total: number; count: number; sessions: Set<string>; best: number }>()
    for (const r of (runs || [])) {
      const existing = playerStats.get(r.player_id) || { total: 0, count: 0, sessions: new Set<string>(), best: Infinity }
      existing.total += r.value
      existing.count += 1
      existing.sessions.add(r.session_id)
      existing.best = Math.min(existing.best, r.value)
      playerStats.set(r.player_id, existing)
    }

    const memberRoleMap = new Map(members.map(m => [m.user_id, m.role]))

    const players = profiles.map(p => {
      const stats = playerStats.get(p.id)
      return {
        id: p.id,
        name: p.player_name || p.display_name,
        jerseyNumber: p.jersey_number,
        position: p.position,
        avatarUrl: p.avatar_url,
        role: memberRoleMap.get(p.id) || 'player',
        sessionCount: stats ? stats.sessions.size : 0,
        runCount: stats ? stats.count : 0,
        average: stats ? Math.round((stats.total / stats.count) * 10) / 10 : null,
        personalBest: stats && stats.best !== Infinity ? Math.round(stats.best * 10) / 10 : null,
      }
    }).sort((a, b) => {
      // Sort by average ascending (best first), nulls last
      if (a.average === null && b.average === null) return 0
      if (a.average === null) return 1
      if (b.average === null) return -1
      return a.average - b.average
    })

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Players API error:', error)
    return NextResponse.json({ players: [] }, { status: 500 })
  }
}
