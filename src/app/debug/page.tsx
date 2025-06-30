'use client'

import { useEffect, useState } from 'react'
import { useSession, getProviders } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

interface DebugInfo {
  providers: any
  session: any
  environment: {
    isProduction: boolean
    hasGoogleCredentials: boolean
    nextAuthUrl: string
  }
  images: {
    placeholder: boolean
    productImages: string[]
  }
}

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<any>({})
  const [serverSession, setServerSession] = useState<any>(null)

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        // Get providers
        const providers = await getProviders()
        
        // Test image availability
        const imageTests = await Promise.allSettled([
          fetch('/placeholder.png').then(r => r.ok),
          fetch('/placeholder.svg').then(r => r.ok),
          fetch('/images/placeholder.jpg').then(r => r.ok),
        ])

        const debugInfo: DebugInfo = {
          providers,
          session,
          environment: {
            isProduction: process.env.NODE_ENV === 'production',
            hasGoogleCredentials: !!(providers?.google),
            nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set'
          },
          images: {
            placeholder: imageTests.every(result => result.status === 'fulfilled' && result.value),
            productImages: []
          }
        }

        setDebugInfo(debugInfo)
      } catch (error) {
        console.error('Debug info fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDebugInfo()
  }, [session])

  const testGoogleAuth = async () => {
    try {
      const response = await fetch('/api/auth/providers')
      const providers = await response.json()
      setTestResults({
        ...testResults,
        googleAuth: {
          success: !!providers.google,
          data: providers
        }
      })
    } catch (error: any) {
      setTestResults({
        ...testResults,
        googleAuth: {
          success: false,
          error: error.message
        }
      })
    }
  }

  const testImageLoad = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  const runImageTests = async () => {
    const testImages = [
      '/placeholder.png',
      '/placeholder.svg', 
      '/images/placeholder.jpg',
      'https://cdn.prosystem.com.bd/images/AMISHEE/DSC09650c389a0c9-336b-4891-bba1-204a5dbd5468.jpg'
    ]

    const results = await Promise.allSettled(
      testImages.map(async (url) => ({
        url,
        success: await testImageLoad(url)
      }))
    )

    setTestResults({
      ...testResults,
      images: results.map((result, index) => ({
        url: testImages[index],
        success: result.status === 'fulfilled' ? result.value.success : false,
        error: result.status === 'rejected' ? result.reason : null
      }))
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Debug Dashboard</h1>
        <p className="text-gray-600 mt-2">System diagnostics and troubleshooting</p>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'authenticated' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Badge variant={status === 'authenticated' ? 'default' : 'destructive'}>
                {status}
              </Badge>
            </div>
            {session && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">User:</span>
                  <span>{session.user?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Email:</span>
                  <span>{session.user?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Provider:</span>
                  <span>{session.user?.image?.includes('google') ? 'Google' : 'Credentials'}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Environment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Environment:</span>
              <Badge variant={debugInfo?.environment.isProduction ? 'default' : 'secondary'}>
                {debugInfo?.environment.isProduction ? 'Production' : 'Development'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Google Auth:</span>
              <Badge variant={debugInfo?.environment.hasGoogleCredentials ? 'default' : 'destructive'}>
                {debugInfo?.environment.hasGoogleCredentials ? 'Configured' : 'Missing'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">NextAuth URL:</span>
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {debugInfo?.environment.nextAuthUrl}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testGoogleAuth}>Test Google Auth</Button>
              <Button onClick={runImageTests}>Test Images</Button>
            </div>
            
            {testResults.googleAuth && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Google Auth Test Result:</h4>
                <Badge variant={testResults.googleAuth.success ? 'default' : 'destructive'}>
                  {testResults.googleAuth.success ? 'Success' : 'Failed'}
                </Badge>
                {testResults.googleAuth.error && (
                  <p className="text-red-600 text-sm mt-2">{testResults.googleAuth.error}</p>
                )}
              </div>
            )}

            {testResults.images && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Image Test Results:</h4>
                <div className="space-y-2">
                  {testResults.images.map((result: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-mono">{result.url}</span>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'OK' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">For Google Login Issues:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Check environment variables in production</li>
                <li>Verify authorized domains in Google Console</li>
                <li>Ensure NEXTAUTH_URL matches your domain</li>
                <li>Check authorized redirect URIs include /api/auth/callback/google</li>
              </ol>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">For Image Issues:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Placeholder images have been created</li>
                <li>Verify public folder is deployed correctly</li>
                <li>Check CDN image URLs are accessible</li>
                <li>Ensure Next.js image domains are configured</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Debug Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Debug Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Session Data:</h4>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Providers Data:</h4>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(debugInfo?.providers, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Server Session Test */}
      <Card>
        <CardHeader>
          <CardTitle>Server Session Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => {
                fetch('/api/debug/session')
                  .then(res => res.json())
                  .then(data => setServerSession(data))
              }}
            >
              Test Server Session
            </Button>
            
            {serverSession && (
              <div>
                <h4 className="font-medium mb-2">Server Session Result:</h4>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(serverSession, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}