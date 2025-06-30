'use client'

import { useEffect, useState } from 'react'
import { useSession, getProviders } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [providers, setProviders] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providers = await getProviders()
        setProviders(providers)
      } catch (error) {
        console.error('Failed to fetch providers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProviders()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Debug Dashboard</h1>
      
      {/* Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'authenticated' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-yellow-500" />}
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            {session?.user && (
              <>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Role:</strong> {session.user.role}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="text-blue-500" />
            Auth Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Google Provider:</span>
              <Badge variant={providers?.google ? 'default' : 'destructive'}>
                {providers?.google ? 'Available' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Credentials Provider:</span>
              <Badge variant={providers?.credentials ? 'default' : 'destructive'}>
                {providers?.credentials ? 'Available' : 'Missing'}
              </Badge>
            </div>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">Raw Provider Data</summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(providers, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Use this page to diagnose authentication and image loading issues.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild variant="outline">
                <a href="/signin">Test Login Page</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/account">Test Account Page</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/order-tracking">Test Order Tracking</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/api/auth/providers" target="_blank">View Auth Providers API</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
