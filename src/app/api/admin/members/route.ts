import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireRole, ApiError } from '@/lib/utils/permissions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_ROLES = ['admin', 'player', 'viewer'] as const
type Role = (typeof VALID_ROLES)[number]

function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && VALID_ROLES.includes(value as Role)
}

export async function GET() {
  try {
    await requireRole('admin')

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, email, display_name, player_name, jersey_number, position, role, is_active, created_at, height_cm, weight_kg, date_of_birth'
      )
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ members: data })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const ALLOWED_FIELDS = [
  'display_name', 'player_name', 'jersey_number', 'position',
  'role', 'is_active', 'height_cm', 'weight_kg', 'date_of_birth',
] as const

export async function PATCH(request: Request) {
  try {
    await requireRole('admin')

    const body = await request.json()
    const { profileId, ...fields } = body

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId is required' },
        { status: 400 }
      )
    }

    // Build update object from allowed fields only
    const updateData: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (key in fields) {
        updateData[key] = fields[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '更新するフィールドが指定されていません' },
        { status: 400 }
      )
    }

    // Validate role if provided
    if ('role' in updateData && !isValidRole(updateData.role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profileId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Sync role to auth app_metadata if role was changed
    if ('role' in updateData) {
      await supabase.auth.admin.updateUserById(profileId, {
        app_metadata: { role: updateData.role },
      })
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await requireRole('admin')

    const body = await request.json()
    const { playerName, jerseyNumber, position, role } = body

    if (!playerName || !playerName.trim()) {
      return NextResponse.json({ error: '選手名は必須です' }, { status: 400 })
    }

    const memberRole = isValidRole(role) ? role : 'player'

    // Get the team ID
    const { data: teams } = await supabase.from('teams').select('id').limit(1)
    const teamId = teams?.[0]?.id
    if (!teamId) {
      return NextResponse.json({ error: 'チームが見つかりません' }, { status: 404 })
    }

    // Create auth user with a generated email
    const randomSuffix = Math.random().toString(36).slice(2, 8)
    const generatedEmail = `player${randomSuffix}@corenova.local`

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: generatedEmail,
      password: `corenova-${randomSuffix}-${Date.now()}`,
      email_confirm: true,
      app_metadata: { role: memberRole },
    })

    if (authError || !authUser.user) {
      return NextResponse.json({ error: authError?.message || 'ユーザー作成に失敗' }, { status: 500 })
    }

    const userId = authUser.user.id

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: generatedEmail,
      display_name: playerName.trim(),
      player_name: playerName.trim(),
      jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
      position: position || null,
      role: memberRole,
      is_active: true,
      locale: 'ja',
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Add to team
    await supabase.from('team_members').insert({
      team_id: teamId,
      profile_id: userId,
      role: memberRole,
    })

    // Fetch the created profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, display_name, player_name, jersey_number, position, role, is_active, created_at')
      .eq('id', userId)
      .single()

    return NextResponse.json({ member: profile })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
