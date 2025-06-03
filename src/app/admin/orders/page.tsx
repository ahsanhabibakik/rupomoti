'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// This would come from your backend in a real application
const mockOrders = [
  {
    id: '1',
    date: '2024-03-20',
    customerName: 'আব্দুল্লাহ',
    phone: '01712345678',
    address: 'মিরপুর-10, ঢাকা',
    items: [
      { name: 'Classic Pearl Necklace', quantity: 1, price: 2999 }
    ],
    total: 3059,
    status: 'pending',
    deliveryArea: 'insideDhaka',
    paymentMethod: 'cod'
  },
  // Add more mock orders as needed
]

type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function OrdersPage() {
  const [orders] = useState(mockOrders)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">অর্ডার সমূহ</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>অর্ডার আইডি</TableHead>
              <TableHead>তারিখ</TableHead>
              <TableHead>কাস্টমার</TableHead>
              <TableHead>পণ্য</TableHead>
              <TableHead>মোট মূল্য</TableHead>
              <TableHead>স্টেটাস</TableHead>
              <TableHead>অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString('bn-BD')}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {order.items.map((item, index) => (
                    <div key={index} className="text-sm">
                      {item.name} x {item.quantity}
                    </div>
                  ))}
                </TableCell>
                <TableCell>৳{order.total}</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status as OrderStatus]}>
                    {order.status === 'pending' && 'অপেক্ষমান'}
                    {order.status === 'confirmed' && 'কনফার্ম করা হয়েছে'}
                    {order.status === 'delivered' && 'ডেলিভারি হয়েছে'}
                    {order.status === 'cancelled' && 'বাতিল করা হয়েছে'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    বিস্তারিত দেখুন
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 