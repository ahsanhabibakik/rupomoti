'use client'

import { useState } from 'react'

export default function MediaTestPage() {
  const [authStatus, setAuthStatus] = useState('Click "Test Auth" to check status...')
  const [mediaStatus, setMediaStatus] = useState('Click "Test Media API" to check status...')
  const [heroStatus, setHeroStatus] = useState('Click "Test Hero API" to check status...')

  const testAuth = async () => {
    setAuthStatus('Testing authentication...')
    
    try {
      const response = await fetch('/api/admin/auth-test')
      const data = await response.json()
      
      if (response.ok) {
        setAuthStatus(`✅ Authentication Success!
User: ${data.user.email}
Role: ${data.user.role}
Is Admin: ${data.user.isAdmin}
Has Media Permission: ${data.hasMediaPermission ? 'Yes' : 'No'}`)
      } else {
        setAuthStatus(`❌ Authentication Failed
Error: ${data.error}
Status: ${response.status}`)
      }
    } catch (error: any) {
      setAuthStatus(`❌ Request Failed
Error: ${error.message}`)
    }
  }

  const testMediaAPI = async () => {
    setMediaStatus('Testing media API...')
    
    try {
      const response = await fetch('/api/admin/media')
      const data = await response.json()
      
      if (response.ok) {
        setMediaStatus(`✅ Media API Success!
Found ${data.length} media items
Hero slides: ${data.filter((m: any) => m.section === 'hero-slider').length}`)
      } else {
        setMediaStatus(`❌ Media API Failed
Error: ${data.error}
Status: ${response.status}`)
      }
    } catch (error: any) {
      setMediaStatus(`❌ Request Failed
Error: ${error.message}`)
    }
  }

  const testHeroAPI = async () => {
    setHeroStatus('Testing hero slider API...')
    
    try {
      const response = await fetch('/api/public/media/hero-slider')
      const data = await response.json()
      
      if (response.ok) {
        setHeroStatus(`✅ Hero API Success!
Found ${data.length} hero slides
Slides: ${data.map((slide: any) => slide.title).join(', ')}`)
      } else {
        setHeroStatus(`❌ Hero API Failed
Error: ${data.error || 'Unknown error'}
Status: ${response.status}`)
      }
    } catch (error: any) {
      setHeroStatus(`❌ Request Failed
Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Media Management Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Authentication Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🔐 Authentication Test</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to test authentication status and permissions:
            </p>
            <div className="p-4 bg-gray-100 rounded mb-4">
              <pre className="whitespace-pre-wrap text-sm">{authStatus}</pre>
            </div>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={testAuth}
            >
              Test Auth
            </button>
          </div>

          {/* Media API Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📁 Media API Test</h2>
            <p className="text-gray-600 mb-4">
              Test fetching media from the admin API:
            </p>
            <div className="p-4 bg-gray-100 rounded mb-4">
              <pre className="whitespace-pre-wrap text-sm">{mediaStatus}</pre>
            </div>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={testMediaAPI}
            >
              Test Media API
            </button>
          </div>

          {/* Hero Slider Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🎠 Hero Slider Test</h2>
            <p className="text-gray-600 mb-4">
              Test the public hero slider API:
            </p>
            <div className="p-4 bg-gray-100 rounded mb-4">
              <pre className="whitespace-pre-wrap text-sm">{heroStatus}</pre>
            </div>
            <button 
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              onClick={testHeroAPI}
            >
              Test Hero API
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🔗 Quick Links</h2>
            <div className="space-y-2">
              <a 
                href="/admin/media" 
                className="block bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-center"
              >
                Go to Admin Media Manager
              </a>
              <a 
                href="/" 
                className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-center"
              >
                View Homepage (Hero Banner)
              </a>
              <a 
                href="/signin" 
                className="block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-center"
              >
                Sign In (if needed)
              </a>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">📋 Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>First, make sure you&apos;re signed in as an Admin or Super Admin</li>
            <li>Click &quot;Test Auth&quot; to verify your authentication status</li>
            <li>Click &quot;Test Media API&quot; to check if you can access the admin media endpoint</li>
            <li>Click &quot;Test Hero API&quot; to verify the public hero slider data</li>
            <li>Visit the Admin Media Manager to test file uploads</li>
            <li>Check the homepage to see if hero banner images are displaying</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
