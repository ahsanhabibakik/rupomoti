"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Loader2 } from 'lucide-react'

const COURIERS = [
  { value: 'Steadfast', label: 'Steadfast' },
  { value: 'RedX', label: 'RedX' },
  { value: 'Pathao', label: 'Pathao' },
  { value: 'CarryBee', label: 'CarryBee' },
]

export default function CourierAnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/orders?page=1&limit=1000')
        const data = await res.json()
        setOrders(data.orders || [])
      } catch (e) {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Aggregate stats by courier
  const courierStats = COURIERS.map((courier) => {
    const courierOrders = orders.filter(
      (o) => (o.courier || (o.steadfastInfo?.trackingId ? 'Steadfast' : null)) === courier.value
    )
    const delivered = courierOrders.filter((o) => o.status === 'DELIVERED').length
    const pending = courierOrders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'CONFIRMED').length
    const cancelled = courierOrders.filter((o) => o.status === 'CANCELLED').length
    const total = courierOrders.length
    const amount = courierOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    return {
      courier: courier.label,
      delivered,
      pending,
      cancelled,
      total,
      amount,
    }
  })

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Courier Analytics</h1>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Orders by Courier</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Courier</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Cancelled</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courierStats.map((stat) => (
                    <TableRow key={stat.courier}>
                      <TableCell>{stat.courier}</TableCell>
                      <TableCell>
                        <Badge variant="default">{stat.delivered}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stat.pending}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{stat.cancelled}</Badge>
                      </TableCell>
                      <TableCell>{stat.total}</TableCell>
                      <TableCell>৳{stat.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Courier Performance</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courierStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="courier" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="delivered" fill="#22c55e" name="Delivered" />
                  <Bar dataKey="pending" fill="#fbbf24" name="Pending" />
                  <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 