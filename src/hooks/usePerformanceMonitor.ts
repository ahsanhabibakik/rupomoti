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

export function PerformanceIndicator({ metrics }: { metrics: PerformanceMetrics }) {
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-50">
      <div>Initial: {metrics.initialLoadTime.toFixed(0)}ms</div>
      <div>API calls: {metrics.apiCallCount}</div>
    </div>
  )
}
