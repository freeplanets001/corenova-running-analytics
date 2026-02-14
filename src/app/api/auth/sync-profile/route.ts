import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if profile exists
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ synced: false, message: 'Profile already exists' })
    }

    // Profile doesn't exist — create one
    const metadata = user.user_metadata || {}
    const displayName = metadata.display_name || user.email?.split('@')[0] || 'User'

    await supabaseAdmin.from('profiles').insert({
      id: user.id,
      email: user.email!,
      display_name: displayName,
      player_name: metadata.player_name || null,
      role: 'viewer',
      is_active: true,
      locale: 'ja',
    })

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: { role: 'viewer' },
    })

    // Add to team
    const { data: teams } = await supabaseAdmin.from('teams').select('id').limit(1)
    if (teams?.[0]) {
      await supabaseAdmin.from('team_members').insert({
        team_id: teams[0].id,
        profile_id: user.id,
        role: 'viewer',
      })
    }

    return NextResponse.json({ synced: true })
  } catch (error) {
    console.error('sync-profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
