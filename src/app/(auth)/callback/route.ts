import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/overview'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user
      const metadata = user.user_metadata || {}

      // Check if profile already exists
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        const linkedPlayerId = metadata.linked_player_id
        const displayName = metadata.display_name || user.email?.split('@')[0] || 'User'

        if (linkedPlayerId) {
          // Link to existing player: transfer data from old player profile
          const { data: oldPlayer } = await supabaseAdmin
            .from('profiles')
            .select('player_name, jersey_number, position')
            .eq('id', linkedPlayerId)
            .single()

          // Create new profile copying player data
          await supabaseAdmin.from('profiles').insert({
            id: user.id,
            email: user.email!,
            display_name: displayName,
            player_name: oldPlayer?.player_name || metadata.player_name || null,
            jersey_number: oldPlayer?.jersey_number || null,
            position: oldPlayer?.position || null,
            role: 'player',
            is_active: true,
            locale: 'ja',
          })

          // Reassign all session_runs from old player to new user
          await supabaseAdmin
            .from('session_runs')
            .update({ player_id: user.id })
            .eq('player_id', linkedPlayerId)

          // Reassign session_player_stats
          await supabaseAdmin
            .from('session_player_stats')
            .update({ player_id: user.id })
            .eq('player_id', linkedPlayerId)

          // Get team from old membership, add new user, remove old
          const { data: oldMembership } = await supabaseAdmin
            .from('team_members')
            .select('team_id')
            .eq('profile_id', linkedPlayerId)
            .single()

          if (oldMembership) {
            await supabaseAdmin.from('team_members').insert({
              team_id: oldMembership.team_id,
              profile_id: user.id,
              role: 'player',
            })
            await supabaseAdmin
              .from('team_members')
              .delete()
              .eq('profile_id', linkedPlayerId)
          }

          // Deactivate old profile
          await supabaseAdmin
            .from('profiles')
            .update({ is_active: false })
            .eq('id', linkedPlayerId)
        } else {
          // No linked player - create fresh profile as viewer
          await supabaseAdmin.from('profiles').insert({
            id: user.id,
            email: user.email!,
            display_name: displayName,
            player_name: metadata.player_name || null,
            role: 'viewer',
            is_active: true,
            locale: 'ja',
          })

          // Add to team as viewer
          const { data: teams } = await supabaseAdmin.from('teams').select('id').limit(1)
          if (teams?.[0]) {
            await supabaseAdmin.from('team_members').insert({
              team_id: teams[0].id,
              profile_id: user.id,
              role: 'viewer',
            })
          }
        }
      }

      const redirectUrl = new URL(redirect, origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('error', 'auth_callback_error')
  return NextResponse.redirect(loginUrl)
}
