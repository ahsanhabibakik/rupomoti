'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, MinusCircle } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'checking' | 'error'
  timestamp: string
  services: {
    database: {
      status: string
      collections: Record<string, { status: string; count?: number; error?: string }>
      error: string | null
    }
    steadfast: {
      status: string
      error: string | null
    }
  }
}

export function ConnectionStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = async () => {
    try {
      setIsChecking(true)
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error('Failed to check health status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkHealth()
    // Check health status every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!health) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'accessible':
        return 'bg-green-100 text-green-800'
      case 'unhealthy':
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'accessible':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'unhealthy':
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <MinusCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  return (
    <>
      <Alert
        className={`cursor-pointer ${getStatusColor(health.status)}`}
        onClick={() => setIsDialogOpen(true)}
      >
        {getStatusIcon(health.status)}
        <AlertTitle>System Status</AlertTitle>
        <AlertDescription>
          {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
        </AlertDescription>
      </Alert>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              System Status
              <Badge className={getStatusColor(health.status)}>
                {health.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Database Status */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Database
                {getStatusIcon(health.services.database.status)}
              </h3>
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(health.services.database.collections).map(
                    ([name, info]) => (
                      <div
                        key={name}
                        className="p-2 rounded border flex justify-between items-center"
                      >
                        <span>{name}</span>
                        <Badge className={getStatusColor(info.status)}>
                          {info.status === 'accessible'
                            ? `${info.count} records`
                            : info.status}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
                {health.services.database.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {health.services.database.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Steadfast Status */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Steadfast API
                {getStatusIcon(health.services.steadfast.status)}
              </h3>
              {health.services.steadfast.error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {health.services.steadfast.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Last checked: {new Date(health.timestamp).toLocaleString()}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={checkHealth}
                disabled={isChecking}
              >
                {isChecking ? 'Checking...' : 'Check Now'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 