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
import { Loader2, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
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
    delivery_status_logs?: { status: string; time: string; details: string }[];
  };
}

interface TimelineEvent {
  status: string;
  label: string;
  time: string;
  details?: string;
}

const TrackingTimeline = ({ order }: { order: Order }) => {
  const timelineEvents: TimelineEvent[] = [
    { status: 'PENDING', label: 'Order Placed', time: order.createdAt, details: `Order #${order.orderNumber} created.` },
    ...(order.steadfastInfo?.delivery_status_logs || []).map(log => ({
      status: log.status.toUpperCase(),
      label: log.status,
      time: log.time,
      details: log.details,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'IN_TRANSIT':
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(order.status)}
          <span className="font-medium">Status: {order.status}</span>
        </div>
        <Badge variant={
          order.paymentStatus === 'PAID' ? 'default' :
          order.paymentStatus === 'PENDING' ? 'secondary' :
          'destructive'
        } className={
          order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
          order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''
        }>
          {order.paymentStatus}
        </Badge>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-4">Tracking History</h3>
        <div className="relative pl-6">
          <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200" style={{ transform: 'translateX(2.5px)' }}></div>
          {timelineEvents.map((event, index) => (
            <div key={index} className="relative mb-6">
              <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></div>
              <div className="pl-4">
                <p className="font-semibold text-sm">{event.label}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(event.time), 'PPP p')}</p>
                {event.details && <p className="text-xs">{event.details}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function OrderTrackingPage() {
  const { data: session } = useSession();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    setOrder(null);
    try {
      const response = await fetch(`/api/orders/track/${trackingNumber}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found. Please check the tracking number.');
        }
        throw new Error('Failed to fetch tracking info');
      }
      const data = await response.json();
      setOrder(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch tracking information.');
      setOrder(null);
    } finally {
      setLoading(false);
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
                        disabled={loading}
                      />
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
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
                                order.status === 'DELIVERED' ? 'default' :
                                order.status === 'CANCELLED' ? 'destructive' :
                                'secondary'
                              } className={order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}>
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
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {error && (
                <Card className="border-destructive bg-destructive/10">
                  <CardContent className="p-6 flex items-center gap-4">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">Error</p>
                      <p className="text-sm text-destructive/90">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {order && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TrackingTimeline order={order} />
                  </CardContent>
                </Card>
              )}

              {!loading && !error && !order && (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8 border rounded-lg bg-gray-50">
                    <Package className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800">Track your package</h3>
                    <p className="text-sm text-gray-500">Enter your tracking number to see the status of your order.</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 