import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, player_name, jersey_number, position, email')
      .like('email', '%@corenova.local')
      .eq('is_active', true)
      .order('player_name')

    if (error) {
      return NextResponse.json({ players: [] }, { status: 500 })
    }

    const players = (profiles || []).map(p => ({
      id: p.id,
      name: p.player_name || 'Unknown',
      jerseyNumber: p.jersey_number,
      position: p.position,
    }))

    return NextResponse.json({ players })
  } catch {
    return NextResponse.json({ players: [] }, { status: 500 })
  }
}
