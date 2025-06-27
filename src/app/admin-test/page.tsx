'use client'

import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function AdminTestPage() {
  const { data: session, status } = useSession()
  const [loginResult, setLoginResult] = useState<any>(null)

  const handleLogin = async () => {
    try {
      const result = await signIn('credentials', {
        email: 'admin@rupomoti.com',
        password: 'admin123',
        redirect: false,
      })
      setLoginResult(result)
      console.log('Login result:', result)
    } catch (error) {
      console.error('Login error:', error)
      setLoginResult({ error: 'Login failed' })
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setLoginResult(null)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Session Status: {status}</h2>
          {session ? (
            <div>
              <p><strong>User:</strong> {session.user?.name}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Role:</strong> {session.user?.role}</p>
              <p><strong>Is Admin:</strong> {session.user?.isAdmin ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p>Not logged in</p>
          )}
        </div>

        <div className="space-x-4">
          {!session ? (
            <button 
              onClick={handleLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login as Admin
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>

        {loginResult && (
          <div className="bg-yellow-100 p-4 rounded">
            <h3 className="font-semibold">Login Result:</h3>
            <pre className="text-sm">{JSON.stringify(loginResult, null, 2)}</pre>
          </div>
        )}

        <div className="space-y-2">
          <a 
            href="/admin" 
            className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
          >
            Try Admin Dashboard
          </a>
          <a 
            href="/account" 
            className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-center"
          >
            Go to Account Page
          </a>
        </div>
      </div>
    </div>
  )
}
