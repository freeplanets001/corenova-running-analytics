'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserRole, Profile } from '@/types'

interface AuthState {
  user: User | null
  role: UserRole | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    profile: null,
    loading: true,
  })

  const supabase = createClient()

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('プロフィール取得エラー:', error.message)
        return null
      }

      return data as Profile
    },
    [supabase]
  )

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            role: profile?.role ?? (session.user.app_metadata?.role as UserRole) ?? 'viewer',
            profile,
            loading: false,
          })
        } else {
          setState({
            user: null,
            role: null,
            profile: null,
            loading: false,
          })
        }
      } catch (error) {
        console.error('セッション取得エラー:', error)
        setState((prev) => ({ ...prev, loading: false }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id)
        setState({
          user: session.user,
          role: profile?.role ?? (session.user.app_metadata?.role as UserRole) ?? 'viewer',
          profile,
          loading: false,
        })
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          role: null,
          profile: null,
          loading: false,
        })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Update user but keep profile
        setState((prev) => ({
          ...prev,
          user: session.user,
          loading: false,
        }))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))
    await supabase.auth.signOut()
    setState({
      user: null,
      role: null,
      profile: null,
      loading: false,
    })
  }, [supabase])

  return {
    user: state.user,
    role: state.role,
    profile: state.profile,
    loading: state.loading,
    signOut,
  }
}
