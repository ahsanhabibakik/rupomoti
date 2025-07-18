// Re-export auth utilities for convenience
export { auth, signIn, signOut } from '@/app/auth'

// Additional auth utilities
import { getServerSession } from 'next-auth'
import { auth as getAuth } from '@/app/auth'

/**
 * Get the current session for server-side use
 * @deprecated Use auth() instead for App Router
 */
export async function getAuthSession() {
  try {
    return await getAuth()
  } catch (error) {
    console.error('Failed to get auth session:', error)
    return null
  }
}
