"use client";

import { useState } from "react";
import { useCustomers, Customer } from "@/hooks/useCustomers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, User as UserIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { CustomerTableSkeleton } from "@/components/admin/CustomerTableSkeleton";

function CustomerDetailsDialog({
  customer,
  isOpen,
  onOpenChange,
}: {
  customer: Customer | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {customer.name}
                </p>
                <p>
                  <strong>Email:</strong> {customer.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {customer.phone}
                </p>
                <p>
                  <strong>Joined:</strong>{" "}
                  {format(new Date(customer.createdAt), "PPP")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>Total Orders:</strong> {customer.orderCount}
                </p>
                <p>
                  <strong>Total Spent:</strong> ৳
                  {customer.totalSpent.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
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
                    {customer.orders.length > 0 ? (
                      customer.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.orderNumber}</TableCell>
                          <TableCell>
                            {format(new Date(order.createdAt), "PPp")}
                          </TableCell>
                          <TableCell>
                            <Badge>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ৳{order.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { customers, loading, error } = useCustomers(searchTerm);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const renderDesktopView = () => (
    <Card className="hidden md:block">
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
          {customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell className="text-center">
                  {customer.orderCount}
                </TableCell>
                <TableCell className="text-right">
                  ৳{customer.totalSpent.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDetails(customer)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No customers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );

  const renderMobileView = () => (
    <div className="grid gap-4 md:hidden">
      {customers.length > 0 ? (
        customers.map((customer) => (
          <Card key={customer.id} onClick={() => handleViewDetails(customer)}>
            <CardHeader>
              <CardTitle className="text-base">{customer.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>{customer.email}</p>
              <p>{customer.phone}</p>
              <div className="flex justify-between items-center pt-2">
                <Badge variant="secondary">
                  Orders: {customer.orderCount}
                </Badge>
                <span className="font-semibold">
                  ৳{customer.totalSpent.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center py-8">No customers found.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            className="pl-10 w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <CustomerTableSkeleton />
      ) : error ? (
        <div className="text-destructive text-center py-8">{error}</div>
      ) : (
        <>
          {renderDesktopView()}
          {renderMobileView()}
        </>
      )}

      <CustomerDetailsDialog
        customer={selectedCustomer}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
} 