"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, User as UserIcon } from "lucide-react";
import { format } from 'date-fns';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  orders: Order[];
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/customers");
        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };
  
  const renderCustomerRows = () => {
    return customers.map((customer) => (
      <TableRow key={customer.id}>
        <TableCell className="font-medium">{customer.name}</TableCell>
        <TableCell>{customer.email}</TableCell>
        <TableCell>{customer.phone}</TableCell>
        <TableCell className="text-center">{customer.orderCount}</TableCell>
        <TableCell className="text-right">৳{customer.totalSpent.toFixed(2)}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(customer)}>
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-destructive text-center py-8">{error}</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length > 0 ? renderCustomerRows() : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {selectedCustomer && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                Customer Details
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Name:</strong> {selectedCustomer.name}</p>
                        <p><strong>Email:</strong> {selectedCustomer.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                        <p><strong>Joined:</strong> {format(new Date(selectedCustomer.createdAt), 'PPP')}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Purchase History</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Total Orders:</strong> {selectedCustomer.orderCount}</p>
                        <p><strong>Total Spent:</strong> ৳{selectedCustomer.totalSpent.toFixed(2)}</p>
                    </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer.orders.length > 0 ? (
                        selectedCustomer.orders.map(order => (
                          <TableRow key={order.id}>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell>{format(new Date(order.createdAt), 'PPp')}</TableCell>
                            <TableCell><Badge>{order.status}</Badge></TableCell>
                            <TableCell className="text-right">৳{order.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">No orders found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 