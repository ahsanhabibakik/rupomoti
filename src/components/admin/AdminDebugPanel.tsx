import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function AdminDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDebugTest = async () => {
    setLoading(true)
    try {
      // Test direct API call
      const response = await fetch('/api/admin/debug', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDebugInfo(data)
      console.log('🔍 Debug API Response:', data)
    } catch (error) {
      console.error('❌ Debug API Error:', error)
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testOrdersAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders?status=active&page=1&limit=5', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDebugInfo({ ordersTest: data })
      console.log('📊 Orders API Response:', data)
    } catch (error) {
      console.error('❌ Orders API Error:', error)
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testQueryDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/test-queries', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDebugInfo({ queryDiagnostics: data })
      console.log('🔧 Query Diagnostics:', data)
    } catch (error) {
      console.error('❌ Query Diagnostics Error:', error)
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">🔧 Admin Debug Panel</h3>
      <div className="flex gap-2 mb-3">
        <Button 
          onClick={runDebugTest}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          {loading ? 'Testing...' : 'Test Database'}
        </Button>
        <Button 
          onClick={testOrdersAPI}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          {loading ? 'Testing...' : 'Test Orders API'}
        </Button>
      </div>
      
      {debugInfo && (
        <div className="bg-white border rounded p-3">
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
