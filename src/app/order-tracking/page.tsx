"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Loader2, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { showToast } from "@/lib/toast";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  steadfastInfo?: {
    trackingId?: string;
    status?: string;
    lastUpdate?: string;
    lastMessage?: string;
  };
}

export default function OrderTrackingPage() {
  const { data: session } = useSession();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserOrders();
    }
  }, [session]);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch('/api/orders/user');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setUserOrders(data);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      showToast.error('Please enter a tracking number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/track/${trackingNumber}`);
      if (!response.ok) throw new Error('Failed to fetch tracking info');
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      showToast.error('Failed to fetch tracking information');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="relative h-[40vh] bg-pearl-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/60" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl text-pearl">
            <h1 className="font-display text-5xl md:text-6xl mb-4">Order Tracking</h1>
            <p className="text-lg md:text-xl text-pearl-light">
              Track your order status and delivery updates
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Tracking Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Track Your Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter your tracking number or order number"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                      />
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Tracking...
                          </>
                        ) : (
                          'Track Order'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Orders (if logged in) */}
              {session?.user && userOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {userOrders.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 rounded-lg border cursor-pointer hover:bg-accent"
                            onClick={() => {
                              setTrackingNumber(order.orderNumber);
                              handleSubmit(new Event('submit') as any);
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Order #{order.orderNumber}</span>
                              <Badge variant={
                                order.status === 'DELIVERED' ? 'success' :
                                order.status === 'CANCELLED' ? 'destructive' :
                                'default'
                              }>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(order.createdAt), 'PPP')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tracking Results */}
            <div>
              {order && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Order Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="font-medium">Status: {order.status}</span>
                      </div>
                      <Badge variant={
                        order.paymentStatus === 'PAID' ? 'success' :
                        order.paymentStatus === 'PENDING' ? 'warning' :
                        'destructive'
                      }>
                        {order.paymentStatus}
                      </Badge>
                    </div>

                    <Separator />

                    {/* Order Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Order Information</h3>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Number</span>
                            <span>{order.orderNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Date</span>
                            <span>{format(new Date(order.createdAt), 'PPP')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount</span>
                            <span>৳{order.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Information */}
                      {order.steadfastInfo && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-medium mb-2">Delivery Information</h3>
                            <div className="grid gap-2 text-sm">
                              {order.steadfastInfo.trackingId && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Tracking ID</span>
                                  <span>{order.steadfastInfo.trackingId}</span>
                                </div>
                              )}
                              {order.steadfastInfo.status && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Delivery Status</span>
                                  <span>{order.steadfastInfo.status}</span>
                                </div>
                              )}
                              {order.steadfastInfo.lastUpdate && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Last Update</span>
                                  <span>{format(new Date(order.steadfastInfo.lastUpdate), 'PPP')}</span>
                                </div>
                              )}
                              {order.steadfastInfo.lastMessage && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Latest Update</span>
                                  <span>{order.steadfastInfo.lastMessage}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Order Items */}
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2">Order Items</h3>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} × {item.quantity}</span>
                              <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 