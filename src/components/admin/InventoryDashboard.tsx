'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InventoryAlert {
  productId: string
  productName: string
  currentStock: number
  severity: 'low' | 'critical' | 'out_of_stock'
}

export default function InventoryDashboard() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [stockUpdate, setStockUpdate] = useState({
    productId: '',
    amount: '',
    operation: 'increment' as 'increment' | 'decrement'
  })

  // Load inventory alerts
  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/admin/inventory?action=alerts&threshold=10')
      const data = await response.json()
      setAlerts(data)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  // Update stock
  const updateStock = async () => {
    if (!stockUpdate.productId || !stockUpdate.amount) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          productId: stockUpdate.productId,
          changeAmount: parseInt(stockUpdate.amount),
          operation: stockUpdate.operation,
          reason: `Manual stock ${stockUpdate.operation} via dashboard`
        })
      })

      if (response.ok) {
        // Reload alerts after stock update
        await loadAlerts()
        setStockUpdate({ productId: '', amount: '', operation: 'increment' })
      }
    } catch (error) {
      console.error('Failed to update stock:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'out_of_stock': return 'destructive'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
      
      {/* Stock Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Product ID"
              value={stockUpdate.productId}
              onChange={(e) => setStockUpdate(prev => ({ ...prev, productId: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={stockUpdate.amount}
              onChange={(e) => setStockUpdate(prev => ({ ...prev, amount: e.target.value }))}
            />
            <select
              title="Stock Operation"
              className="px-3 py-2 border rounded-md"
              value={stockUpdate.operation}
              onChange={(e) => setStockUpdate(prev => ({ 
                ...prev, 
                operation: e.target.value as 'increment' | 'decrement' 
              }))}
            >
              <option value="increment">Add Stock</option>
              <option value="decrement">Remove Stock</option>
            </select>
            <Button onClick={updateStock} disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Inventory Alerts
            <Button variant="outline" size="sm" onClick={loadAlerts}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-muted-foreground">No inventory alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.productId} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{alert.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Current stock: {alert.currentStock}
                    </p>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity) as any}>
                    {alert.severity.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
