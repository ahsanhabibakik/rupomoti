"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash, Edit, Star } from 'lucide-react'

// Dummy data for demonstration
const user = {
  name: 'Your Name',
  email: 'user@email.com',
  phone: '017XXXXXXXX',
  addresses: [
    { id: 1, label: 'Home', address: '123 Main St, Dhaka', phone: '017XXXXXXXX', isDefault: true },
    { id: 2, label: 'Office', address: '456 Office Rd, Dhaka', phone: '018XXXXXXXX', isDefault: false },
  ],
  wishlist: [
    { id: '1', name: 'Classic Pearl Necklace', price: 2999 },
    { id: '2', name: 'Pearl Drop Earrings', price: 1899 },
  ],
  orders: [
    { id: '1001', status: 'Delivered', total: 2999, date: '2024-06-01' },
    { id: '1002', status: 'Processing', total: 1899, date: '2024-06-10' },
  ],
}

export default function AccountPage() {
  const [addresses, setAddresses] = useState(user.addresses)
  const [wishlist, setWishlist] = useState(user.wishlist)
  const [orders] = useState(user.orders)
  const [editingAddress, setEditingAddress] = useState(null)
  const [newAddress, setNewAddress] = useState({ label: '', address: '', phone: '' })

  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      { ...newAddress, id: Date.now(), isDefault: false },
    ])
    setNewAddress({ label: '', address: '', phone: '' })
  }

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter((a) => a.id !== id))
  }

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>Name: {user.name}</div>
                <div>Email: {user.email}</div>
                <div>Phone: {user.phone}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                  <Card key={item.id} className="flex flex-col items-start p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-muted-foreground mb-2">৳{item.price}</div>
                    <Button size="sm" variant="destructive" onClick={() => setWishlist(wishlist.filter((w) => w.id !== item.id))}>
                      <Trash className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">Order #{order.id}</div>
                      <div className="text-muted-foreground text-sm">{order.status} • {order.date}</div>
                    </div>
                    <div className="font-bold">৳{order.total}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">{address.label} {address.isDefault && <Star className="inline w-4 h-4 text-yellow-500" />}</div>
                      <div className="text-muted-foreground text-sm">{address.address}</div>
                      <div className="text-muted-foreground text-sm">{address.phone}</div>
                    </div>
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <Button size="sm" variant="outline" onClick={() => handleSetDefault(address.id)}>
                          Set Default
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteAddress(address.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Label (e.g. Home, Office)"
                    value={newAddress.label}
                    onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                  />
                  <Input
                    placeholder="Address"
                    value={newAddress.address}
                    onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                  />
                  <Input
                    placeholder="Phone"
                    value={newAddress.phone}
                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                  <Button onClick={handleAddAddress} variant="secondary">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 