'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import type { UserRole } from '@/types'

interface RoleGateProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { role, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
