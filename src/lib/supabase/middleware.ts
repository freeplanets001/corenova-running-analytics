import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes
  const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/invite']
  const isPublic = publicPaths.some((p) => path.startsWith(p))

  if (isPublic) {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/overview'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Redirect root to overview
  if (path === '/') {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/overview' : '/login'
    return NextResponse.redirect(url)
  }

  // Protected routes require auth
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Role-based route protection: check app_metadata first, fall back to profiles table
  let role = user.app_metadata?.role as string | undefined

  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role || undefined
  }

  // Admin-only routes
  const adminOnlyPaths = ['/settings/team', '/settings/members', '/settings/test-types', '/entry/bulk', '/entry/import']
  if (adminOnlyPaths.some((p) => path.startsWith(p)) && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/overview'
    return NextResponse.redirect(url)
  }

  // Player or Admin routes (no viewer)
  const noViewerPaths = ['/entry', '/ai/chat', '/goals/new']
  if (noViewerPaths.some((p) => path.startsWith(p)) && role === 'viewer') {
    const url = request.nextUrl.clone()
    url.pathname = '/overview'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
