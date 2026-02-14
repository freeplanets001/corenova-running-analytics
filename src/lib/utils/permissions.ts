import type { UserRole } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export async function requireRole(
  ...allowedRoles: UserRole[]
): Promise<{ userId: string; role: UserRole; teamId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new ApiError(401, '認証が必要です')
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role || user.app_metadata?.role || 'viewer') as UserRole

  if (!allowedRoles.includes(role)) {
    throw new ApiError(403, 'この操作を行う権限がありません')
  }

  const { data: membership } = await adminClient
    .from('team_members')
    .select('team_id')
    .eq('profile_id', user.id)
    .limit(1)
    .single()

  let teamId = membership?.team_id
  if (!teamId) {
    const { data: teams } = await adminClient.from('teams').select('id').limit(1)
    teamId = teams?.[0]?.id
    if (!teamId) throw new ApiError(404, 'チームが見つかりません')
  }

  return { userId: user.id, role, teamId }
}
