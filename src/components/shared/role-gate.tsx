'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { hasPermission } from '@/lib/constants/roles'
import type { UserRole } from '@/types'
import type { Permission } from '@/lib/constants/roles'

interface RoleGateProps {
  allowedRoles?: UserRole[]
  permission?: keyof Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGate({ allowedRoles, permission, children, fallback = null }: RoleGateProps) {
  const { role, loading } = useAuth()

  if (loading) {
    return null
  }

  if (permission) {
    if (!hasPermission(role, permission)) return <>{fallback}</>
    return <>{children}</>
  }

  if (allowedRoles) {
    if (!role || !allowedRoles.includes(role)) return <>{fallback}</>
    return <>{children}</>
  }

  return <>{children}</>
}
