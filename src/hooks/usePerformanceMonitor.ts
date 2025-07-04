import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  initialLoadTime: number
  apiCallCount: number
  lastApiTime: number
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    initialLoadTime: 0,
    apiCallCount: 0,
    lastApiTime: 0
  })
  const [startTime] = useState(performance.now())

  const recordInitialLoad = () => {
    setMetrics(prev => ({
      ...prev,
      initialLoadTime: performance.now() - startTime
    }))
  }

  const recordApiCall = () => {
    const now = performance.now()
    setMetrics(prev => ({
      ...prev,
      apiCallCount: prev.apiCallCount + 1,
      lastApiTime: now
    }))
  }

  return {
    metrics,
    recordInitialLoad,
    recordApiCall
  }
}

export type { PerformanceMetrics }
