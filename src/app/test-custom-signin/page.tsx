'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomTestSignIn() {
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: 'password123'
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDirectAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult('')

    try {
      // Test direct authentication via API
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: formData.email,
          password: formData.password,
          json: 'true',
          callbackUrl: '/account'
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (response.redirected) {
        setResult(`Redirected to: ${response.url}`)
        // Check if redirected to success page
        if (!response.url.includes('error')) {
          setResult('✅ Authentication successful! Redirected successfully.')
          setTimeout(() => router.push('/account'), 2000)
        } else {
          setResult(`❌ Authentication failed: ${new URL(response.url).searchParams.get('error')}`)
        }
      } else {
        const responseText = await response.text()
        setResult(`Response: ${responseText.substring(0, 200)}...`)
      }
    } catch (error) {
      setResult(`❌ Exception: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/auth/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`❌ Database test failed: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Custom Sign-In Test</h1>
      
      <form onSubmit={handleDirectAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Enter email"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Password:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Enter password"
            required
          />
        </div>
        
        <div className="space-y-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing Direct Auth...' : 'Test Direct Auth'}
          </button>
          
          <button
            type="button"
            onClick={testDatabaseConnection}
            disabled={loading}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing DB...' : 'Test Database Connection'}
          </button>
        </div>
      </form>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}
