import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_SCOPES = ['personal', 'team', 'individual_target'] as const
const VALID_METRICS = ['average_value', 'best_value', 'consistency', 'run_count', 'improvement_rate', 'attendance'] as const

export async function GET() {
  try {
    const { data: teams } = await supabase.from('teams').select('id').limit(1)
    const teamId = teams?.[0]?.id
    if (!teamId) return NextResponse.json({ goals: [] })

    const { data: goals } = await supabase
      .from('goals')
      .select(`
        id, title, description, scope, metric, target_value, current_value,
        unit, direction, start_date, target_date, status, progress_percentage,
        achieved_at, created_at,
        player:profiles!goals_player_id_fkey(id, display_name, player_name),
        test_type:test_types(id, name, unit)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    return NextResponse.json({ goals: goals || [] })
  } catch (error) {
    console.error('Goals API error:', error)
    return NextResponse.json({ goals: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, scope, metric, testTypeId, targetValue, targetDate, playerId, createdBy } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
    }
    if (!VALID_SCOPES.includes(scope)) {
      return NextResponse.json({ error: '無効なスコープです' }, { status: 400 })
    }
    if (!VALID_METRICS.includes(metric)) {
      return NextResponse.json({ error: '無効な指標です' }, { status: 400 })
    }
    if (!targetValue || !targetDate) {
      return NextResponse.json({ error: '目標値と期限は必須です' }, { status: 400 })
    }

    const { data: teams } = await supabase.from('teams').select('id').limit(1)
    const teamId = teams?.[0]?.id
    if (!teamId) {
      return NextResponse.json({ error: 'チームが見つかりません' }, { status: 404 })
    }

    // Look up test type for unit/direction
    let unit = 'seconds'
    let direction = 'decrease'
    if (testTypeId) {
      const { data: tt } = await supabase
        .from('test_types')
        .select('unit, direction')
        .eq('id', testTypeId)
        .single()
      if (tt) {
        unit = tt.unit || 'seconds'
        direction = tt.direction || 'decrease'
      }
    }

    const { data: goal, error } = await supabase
      .from('goals')
      .insert({
        team_id: teamId,
        title: title.trim(),
        description: description?.trim() || null,
        scope,
        metric,
        test_type_id: testTypeId || null,
        player_id: scope === 'personal' ? (playerId || null) : null,
        created_by: createdBy,
        target_value: Number(targetValue),
        target_date: targetDate,
        unit,
        direction,
        status: 'active',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Goal creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: goal.id })
  } catch (error) {
    console.error('Goals POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
