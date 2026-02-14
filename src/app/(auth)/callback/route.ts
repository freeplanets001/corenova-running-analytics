import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/overview'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful auth - redirect to intended destination
      const redirectUrl = new URL(redirect, origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Auth error - redirect to login with error
  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('error', 'auth_callback_error')
  return NextResponse.redirect(loginUrl)
}
