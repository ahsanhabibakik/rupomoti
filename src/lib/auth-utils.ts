import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import { NextResponse } from 'next/server'

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER'

export interface UserWithRole {
  id: string
  email: string
  name?: string | null
  role: UserRole
  isAdmin: boolean
}

/**
 * Check if user is a Super Admin
 */
export function isSuperAdmin(user: UserWithRole | null): boolean {
  return user?.role === 'SUPER_ADMIN' && user?.isAdmin === true
}

/**
 * Check if user is any type of admin (Admin or Super Admin)
 */
export function isAdmin(user: UserWithRole | null): boolean {
  return user?.isAdmin === true && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN')
}

/**
 * Check if user is a Manager
 */
export function isManager(user: UserWithRole | null): boolean {
  return user?.role === 'MANAGER'
}

/**
 * Check if user has elevated privileges (Admin, Super Admin, or Manager)
 */
export function hasElevatedPrivileges(user: UserWithRole | null): boolean {
  return isAdmin(user) || isManager(user)
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Admin'
    case 'ADMIN':
      return 'Admin'
    case 'MANAGER':
      return 'Manager'
    case 'USER':
    default:
      return 'User'
  }
}

/**
 * Check if user can perform specific actions based on their role
 */
export const permissions = {
  // Super Admin permissions
  canManageUsers: (user: UserWithRole | null) => isSuperAdmin(user),
  canManageRoles: (user: UserWithRole | null) => isSuperAdmin(user),
  canManageSettings: (user: UserWithRole | null) => isSuperAdmin(user) || isAdmin(user),
  
  // Admin permissions
  canManageProducts: (user: UserWithRole | null) => hasElevatedPrivileges(user),
  canManageOrders: (user: UserWithRole | null) => hasElevatedPrivileges(user),
  canManageCustomers: (user: UserWithRole | null) => hasElevatedPrivileges(user),
  canManageCategories: (user: UserWithRole | null) => hasElevatedPrivileges(user),
  canManageCoupons: (user: UserWithRole | null) => hasElevatedPrivileges(user),
  canManageReviews: (user: UserWithRole | null) => hasElevatedPrivileges(user),
  
  // Manager permissions
  canViewReports: (user: UserWithRole | null) => hasElevatedPrivileges(user),
  canExportData: (user: UserWithRole | null) => isAdmin(user) || isSuperAdmin(user),
}

/**
 * Super Admin emails for additional validation
 */
export const SUPER_ADMIN_EMAILS = [
  'admin@delwer.com',
  'admin@akik.com',
]

/**
 * Check if email belongs to a super admin
 */
export function isSuperAdminEmail(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Server-side authentication helpers for API routes
 */

/**
 * Check if user has admin privileges (Admin or Super Admin)
 */
export async function requireAdmin() {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }
  
  const userRole = session.user?.role
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) }
  }
  
  return { session, error: null }
}

/**
 * Check if user has elevated privileges (Admin, Super Admin, or Manager)
 */
export async function requireElevatedAccess() {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }
  
  const userRole = session.user?.role
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userRole !== 'MANAGER') {
    return { error: NextResponse.json({ error: 'Admin or Manager access required' }, { status: 403 }) }
  }
  
  return { session, error: null }
}

/**
 * Check if user is Super Admin
 */
export async function requireSuperAdmin() {
  const session = await getServerSession(authConfig)
  
  if (!session) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }
  
  if (session.user?.role !== 'SUPER_ADMIN') {
    return { error: NextResponse.json({ error: 'Super Admin access required' }, { status: 403 }) }
  }
  
  return { session, error: null }
}
