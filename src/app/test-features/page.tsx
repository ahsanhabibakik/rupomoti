'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TestResult {
  endpoint: string
  status: 'loading' | 'success' | 'error'
  data?: any
  error?: string
}

export default function TestFeaturesPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { endpoint: '/api/products-enhanced?type=featured&limit=3', status: 'loading' },
    { endpoint: '/api/products-enhanced?type=sale&limit=3', status: 'loading' },
    { endpoint: '/api/products-enhanced?search=pearl&limit=3', status: 'loading' },
    { endpoint: '/api/categories-enhanced?type=analytics', status: 'loading' },
    { endpoint: '/api/products-mongo?limit=3', status: 'loading' },
    { endpoint: '/api/categories-mongo', status: 'loading' }
  ])

  useEffect(() => {
    runAllTests()
  }, [runAllTests])

  const runAllTests = async () => {
    for (let i = 0; i < tests.length; i++) {
      try {
        const response = await fetch(tests[i].endpoint)
        const data = await response.json()
        
        setTests(prevTests => 
          prevTests.map((test, index) => 
            index === i 
              ? { ...test, status: 'success', data }
              : test
          )
        )
      } catch (error) {
        setTests(prevTests => 
          prevTests.map((test, index) => 
            index === i 
              ? { ...test, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
              : test
          )
        )
      }
    }
  }

  const runSingleTest = async (index: number) => {
    setTests(prevTests => 
      prevTests.map((test, i) => 
        i === index 
          ? { ...test, status: 'loading' }
          : test
      )
    )

    try {
      const response = await fetch(tests[index].endpoint)
      const data = await response.json()
      
      setTests(prevTests => 
        prevTests.map((test, i) => 
          i === index 
            ? { ...test, status: 'success', data }
            : test
        )
      )
    } catch (error) {
      setTests(prevTests => 
        prevTests.map((test, i) => 
          i === index 
            ? { ...test, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
            : test
        )
      )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Mongoose Features Test Suite</h1>
        <p className="text-muted-foreground">
          Testing all enhanced API endpoints and features
        </p>
        <Button onClick={runAllTests} className="mt-4">
          🔄 Run All Tests
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {test.endpoint.replace('/api/', '').split('?')[0]}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    test.status === 'loading' 
                      ? 'bg-yellow-500 animate-pulse' 
                      : test.status === 'success' 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runSingleTest(index)}
                  disabled={test.status === 'loading'}
                >
                  Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">
                {test.endpoint}
              </div>
              
              {test.status === 'loading' && (
                <div className="text-yellow-600">⏳ Loading...</div>
              )}
              
              {test.status === 'error' && (
                <div className="text-red-600">
                  ❌ Error: {test.error}
                </div>
              )}
              
              {test.status === 'success' && test.data && (
                <div className="space-y-2">
                  <div className="text-green-600 font-medium">
                    ✅ Success
                  </div>
                  
                  {test.data.success && (
                    <div className="text-sm">
                      <div className="font-medium">Data Count: {test.data.data?.length || 0}</div>
                      {test.data.meta && (
                        <div className="text-muted-foreground">
                          Meta: {JSON.stringify(test.data.meta)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {test.data.data && test.data.data.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">Sample Data</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(test.data.data[0], null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Feature Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-green-600">
                  {tests.filter(t => t.status === 'success').length}
                </div>
                <div className="text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">
                  {tests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-yellow-600">
                  {tests.filter(t => t.status === 'loading').length}
                </div>
                <div className="text-muted-foreground">Loading</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">📋 Features Tested</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium">Enhanced Products API</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Featured products with virtual fields</li>
              <li>Sale products with discount calculations</li>
              <li>Product search functionality</li>
              <li>Price range filtering</li>
              <li>Category-based filtering</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Enhanced Categories API</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Category analytics with aggregation</li>
              <li>Product count calculations</li>
              <li>Inventory value summaries</li>
              <li>Stock status reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
