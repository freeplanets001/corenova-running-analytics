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
    if (!teamId) return NextResponse.json({ testTypes: [] })

    const { data } = await supabase
      .from('test_types')
      .select('id, name, unit, direction, min_value, max_value, is_active')
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('sort_order')

    return NextResponse.json({ testTypes: data || [] })
  } catch (error) {
    console.error('Test types API error:', error)
    return NextResponse.json({ testTypes: [] }, { status: 500 })
  }
}
