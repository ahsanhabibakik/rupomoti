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
      case 'DELIVERED': return 'from-green-400 to-green-600';
      case 'CANCELLED': return 'from-red-400 to-red-600';
      case 'IN_TRANSIT':
      case 'SHIPPED': return 'from-blue-400 to-blue-600';
      default: return 'from-amber-400 to-amber-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${getStatusColor(order.status)} shadow-lg`}>
                {getStatusIcon(order.status)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {order.status.replace('_', ' ')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
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
      setOrder(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch tracking information.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
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
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Perfect Order
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Stay updated with real-time tracking information and delivery status for your jewelry orders
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative -mt-16 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Tracking Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                      <Search className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      Track Your Order
                    </CardTitle>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Enter your tracking number or order number to get real-time updates
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Enter tracking number (e.g., RUP-12345)"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        disabled={loading}
                        className="pl-12 h-14 text-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-700 rounded-xl"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                          <Clock className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
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
                              className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:shadow-lg"
                              onClick={() => {
                                setTrackingNumber(order.orderNumber);
                                handleSubmit(new Event('submit') as any);
                              }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
                                    <Package className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                      #{order.orderNumber}
                                    </span>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
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
                                      order.status === 'DELIVERED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''
                                    }`}
                                  >
                                    {order.status}
                                  </Badge>
                                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
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
                  className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl"
                >
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    Tracking your package...
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
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
                  <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-xl">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-500 rounded-2xl text-white">
                          <AlertCircle className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                            Order Not Found
                          </h3>
                          <p className="text-red-700 dark:text-red-300 leading-relaxed">
                            {error}
                          </p>
                          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <p className="text-sm text-red-800 dark:text-red-200">
                              <strong>Tips:</strong> Make sure you entered the correct tracking number. 
                              It should look like "RUP-12345" or similar format.
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
                  className="flex flex-col items-center justify-center text-center p-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-xl opacity-20" />
                    <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white">
                      <Package className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                    Ready to Track Your Package
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                    Enter your tracking number above to see real-time updates, delivery status, and estimated arrival time.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                      <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Real-time Updates</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
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