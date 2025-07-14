export const runtime = 'nodejs';

import { auth } from '@/lib/auth-node'

export async function verifyAdminAccess() {
  const session = await auth()
  
  if (!session?.user) {
    return { authorized: false, session: null }
  }

  const user = session.user
  const userRole = user.role as string
  const isAdmin = user.isAdmin as boolean
  
  // Allow access for SUPER_ADMIN, ADMIN, MANAGER roles, or if isAdmin is true
  const hasAdminAccess = isAdmin || 
    userRole === 'ADMIN' || 
    userRole === 'SUPER_ADMIN' || 
    userRole === 'MANAGER'
  
  return { 
    authorized: hasAdminAccess, 
    session,
    user 
  }
}
