import { useSession, signIn, signOut } from 'next-auth/react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setCredentials, logout, selectCurrentUser, selectIsAuthenticated } from '@/redux/slices/authSlice'

export function useAuth() {
  const { data: session } = useSession()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (session?.user) {
        dispatch(setCredentials({
          id: session.user.id as string,
          name: session.user.name as string,
          email: session.user.email as string,
          role: session.user.role as string,
        }))
      }

      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      dispatch(logout())
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout: handleSignOut,
  }
} 