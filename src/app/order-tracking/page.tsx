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
import { 
  Loader2, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  MapPin,
  Calendar,
  User,
  Phone,
  CreditCard,
  ArrowRight,
  Star
} from "lucide-react";
import { showToast } from "@/lib/toast";
import { motion } from "framer-motion";

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
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'IN_TRANSIT':
      case 'SHIPPED':
        return <Truck className="h-6 w-6 text-blue-500" />;
      default:
        return <Clock className="h-6 w-6 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'from-emerald-400 to-emerald-600';
      case 'CANCELLED': return 'from-rose-400 to-rose-600';
      case 'IN_TRANSIT':
      case 'SHIPPED': return 'from-warmOysterGold to-cocoaBrown';
      default: return 'from-amber-400 to-amber-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-warmOysterGold/10 to-cocoaBrown/5 p-6 border border-warmOysterGold/20 shadow-md"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-warmOysterGold/20 to-cocoaBrown/20 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${getStatusColor(order.status || 'PENDING')} shadow-lg`}>
                {getStatusIcon(order.status || 'PENDING')}
              </div>
              <div>
                <h3 className="text-xl font-bold text-cocoaBrown">
                  {order.status?.replace('_', ' ') || 'Unknown Status'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Order #{order.orderNumber}
                </p>
              </div>
            </div>
            <Badge 
              variant={
                order.paymentStatus === 'PAID' ? 'default' :
                order.paymentStatus === 'PENDING' ? 'secondary' :
                'destructive'
              } 
              className={`text-sm px-4 py-2 ${
                order.paymentStatus === 'PAID' ? 'bg-green-500 hover:bg-green-600 text-white' :
                order.paymentStatus === 'PENDING' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {order.paymentStatus}
            </Badge>
          </div>
          
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600 dark:text-slate-400">
                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600 dark:text-slate-400">
                {order.customer.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600 dark:text-slate-400">
                {order.customer.phone}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <Separator className="my-8" />

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-100">
          Tracking Timeline
        </h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-20" />
          
          <div className="space-y-6">
            {timelineEvents.map((event, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Timeline Dot */}
                <div className={`relative z-10 p-2 rounded-2xl bg-gradient-to-br ${getStatusColor(event.status)} shadow-lg`}>
                  {getStatusIcon(event.status)}
                </div>
                
                {/* Event Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {event.label}
                      </h4>
                      <time className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                        {format(new Date(event.time), 'MMM dd, h:mm a')}
                      </time>
                    </div>
                    {event.details && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {event.details}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
      setOrder(data.order);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tracking information.';
      setError(errorMessage);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearlWhite via-pearlWhite/90 to-pearlWhite/80 dark:from-cocoaBrown/90 dark:via-cocoaBrown/80 dark:to-cocoaBrown/70">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-warmOysterGold via-cocoaBrown to-cocoaBrown/90">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-champagneSheen/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-warmOysterGold/10 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 pt-6 pb-20 lg:pb-28 lg:pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <Package className="w-5 h-5" />
              <span className="text-sm font-medium">Real-time Order Tracking</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Track Your
              <span className="block">
                <span className="bg-gradient-to-r from-champagneSheen to-warmOysterGold bg-clip-text text-transparent font-bold"
                      style={{
                        background: 'linear-gradient(to right,  #efa62d, #8e5e00)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: '#C8B38A' // Fallback color
                      }}>
                  Perfect Order
                </span>
              
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Stay updated with real-time tracking information and delivery status for your jewelry orders
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative -mt-16 pb-20 z-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Tracking Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <Card className="border border-warmOysterGold/20 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-warmOysterGold to-cocoaBrown"></div>
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-warmOysterGold to-cocoaBrown rounded-xl text-white shadow-md">
                      <Search className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-2xl font-bold font-display text-cocoaBrown">
                      Track Your Order
                    </CardTitle>
                  </div>
                  <p className="text-muted-foreground">
                    Enter your order number to receive real-time updates on your jewelry
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warmOysterGold/70" />
                      <Input
                        type="text"
                        placeholder="Enter order number (e.g., RUP-12345)"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        disabled={loading}
                        className="pl-12 h-14 text-lg border-warmOysterGold/30 focus:border-warmOysterGold focus:ring-warmOysterGold/50 bg-white rounded-xl"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-warmOysterGold to-cocoaBrown hover:opacity-90 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          Tracking Your Order...
                        </>
                      ) : (
                        <>
                          <Package className="mr-3 h-5 w-5" />
                          Track My Order
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              {session?.user && userOrders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="border border-warmOysterGold/20 shadow-lg bg-white/90 backdrop-blur-sm">
                    <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-warmOysterGold/50 to-cocoaBrown/50"></div>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-warmOysterGold to-cocoaBrown rounded-xl text-white shadow-md">
                          <Clock className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-bold font-display text-cocoaBrown">
                          Your Recent Orders
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-3">
                          {userOrders.map((order, index) => (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="group p-4 rounded-xl border border-warmOysterGold/20 cursor-pointer hover:bg-gradient-to-r hover:from-warmOysterGold/5 hover:to-cocoaBrown/5 transition-all duration-300 hover:shadow-md"
                              onClick={() => {
                                setTrackingNumber(order.orderNumber);
                                handleSubmit(new Event('submit') as unknown as React.FormEvent);
                              }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-warmOysterGold to-cocoaBrown rounded-lg text-white group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <Package className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="font-semibold text-cocoaBrown">
                                      #{order.orderNumber}
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={
                                      order.status === 'DELIVERED' ? 'default' :
                                      order.status === 'CANCELLED' ? 'destructive' :
                                      'secondary'
                                    } 
                                    className={`${
                                      order.status === 'DELIVERED' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 
                                      order.status === 'SHIPPED' || order.status === 'IN_TRANSIT' ? 'bg-warmOysterGold hover:bg-warmOysterGold/90 text-white' : ''
                                    }`}
                                  >
                                    {order.status || 'Unknown'}
                                  </Badge>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cocoaBrown group-hover:translate-x-1 transition-all duration-300" />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            {/* Tracking Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl"
                >
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-t-2 border-warmOysterGold animate-spin"></div>
                    <div className="absolute inset-1 rounded-full border-t-2 border-cocoaBrown animate-spin animation-delay-150"></div>
                    <div className="absolute inset-2 rounded-full border-t-2 border-warmOysterGold/70 animate-spin animation-delay-300"></div>
                  </div>
                  <p className="text-xl font-medium font-display text-cocoaBrown">
                    Tracking your order...
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please wait while we fetch the latest updates
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border border-roseGoldAccent/30 bg-gradient-to-br from-roseGoldAccent/10 to-roseGoldAccent/5 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-roseGoldAccent to-roseGoldAccent/80 rounded-2xl text-white shadow-md">
                          <AlertCircle className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-cocoaBrown mb-2">
                            Order Not Found
                          </h3>
                          <p className="text-minkTaupe leading-relaxed">
                            {error}
                          </p>
                          <div className="mt-4 p-4 bg-roseGoldAccent/10 rounded-xl border border-roseGoldAccent/20">
                            <p className="text-sm text-minkTaupe">
                              <strong>Tips:</strong> Make sure you entered the correct tracking number. 
                              It should look like &quot;RUP-12345&quot; or similar format.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {order && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          Order Found!
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <TrackingTimeline order={order} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {!loading && !error && !order && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-gradient-to-br from-pearlWhite to-champagneSheen/20 dark:from-cocoaBrown/80 dark:to-cocoaBrown/60 border border-warmOysterGold/20 dark:border-warmOysterGold/10"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#efa62d] to-[#8e5e00] rounded-full blur-xl opacity-20" />
                    <div className="relative p-6 bg-gradient-to-br from-[#efa62d] to-[#8e5e00] rounded-2xl text-white">
                      <Package className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-primary dark:text-slate-100 mb-3">
                    Ready to Track Your Package
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                    Enter your tracking number above to see real-time updates, delivery status, and estimated arrival time.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="text-center p-4 bg-white  rounded-xl shadow-sm">
                      <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Real-time Updates</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                      <MapPin className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Location Tracking</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 