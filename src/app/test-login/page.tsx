'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState } from 'react'

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@delwer.com')
  const [password, setPassword] = useState('SuperAdmin123!')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const { data: session, status } = useSession()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setResult(`Error: ${result.error}`)
      } else if (result?.ok) {
        setResult('Login successful!')
      } else {
        setResult('Unknown result')
      }
    } catch (error) {
      setResult(`Exception: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Test Super Admin Login</h1>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h3 className="font-semibold">Session Status: {status}</h3>
        {session && (
          <div className="text-sm">
            <p>User: {session.user?.name}</p>
            <p>Email: {session.user?.email}</p>
            <p>Role: {session.user?.role}</p>
            <p>IsAdmin: {session.user?.isAdmin ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{result}</p>
        </div>
      )}
    </div>
  )
}
