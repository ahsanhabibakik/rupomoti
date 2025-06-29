'use client'

import { useEffect, useState, useRef } from 'react'
import { showToast } from '@/lib/toast'

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const prevConnectedRef = useRef<boolean | null>(null)

  useEffect(() => {
    const checkConnection = () => {
      fetch('/api/health')
        .then(res => res.json())
        .then(data => {
          const wasConnected = prevConnectedRef.current
          const isNowConnected = data.status === 'connected'
          
          setIsConnected(isNowConnected)
          
          // Only show toast if connection status has changed after the initial check
          if (prevConnectedRef.current !== null && wasConnected !== isNowConnected) {
            if (isNowConnected) {
              showToast.success('Database connected successfully')
            } else {
              showToast.error('Database connection lost')
            }
          }
          
          prevConnectedRef.current = isNowConnected
        })
        .catch(() => {
          const wasConnected = prevConnectedRef.current
          setIsConnected(false)
          
          // Only show toast if connection status has changed after the initial check
          if (prevConnectedRef.current !== null && wasConnected) {
            showToast.error('Database connection lost')
          }
          
          prevConnectedRef.current = false
        })
    }

    // Check connection immediately
    checkConnection()

    // Then check every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  return null // This component only handles notifications
} 