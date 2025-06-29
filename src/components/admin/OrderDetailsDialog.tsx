'use client'

import { useState, useEffect, Fragment, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { produce } from 'immer'
import { isEqual } from 'lodash'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { showToast } from '@/lib/toast'
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client'
import {
  Loader2,
  Package,
  User,
  History,
  Info,
  Edit,
  Save,
  Truck,
  MessageSquare,
  FileText,
  CreditCard,
  Phone,
  MapPin,
  Flag,
  FlagOff,
} from 'lucide-react'

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: { customer: true; items: { include: { product: true } } }
}> & {
  user?: { isFlagged: boolean } | null;
  isFakeOrder?: boolean;
}

type AuditLogWithUser = {
  id: string
  model: string
  recordId: string
  userId: string
  action: string
  field: string | null
  oldValue: string | null
  newValue: string | null
  details: Record<string, any> | null
  createdAt: string
  user: {
    name: string | null
    email: string | null
  }
}

type OrderDetailsDialogProps = {
  order: OrderWithDetails
}

type EditableOrderState = {
  status: OrderStatus
  paymentStatus: PaymentStatus
  recipientName: string
  recipientPhone: string
  deliveryAddress: string
  courierName: string | null
  trackingId: string | null
}

export function OrderDetailsDialog({ order }: OrderDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editableOrder, setEditableOrder] = useState<EditableOrderState>({
    status: order.status,
    paymentStatus: order.paymentStatus,
    recipientName: order.recipientName ?? order.customer.name,
    recipientPhone: order.recipientPhone ?? order.customer.phone ?? '',
    deliveryAddress: order.deliveryAddress ?? order.customer.address,
    courierName: order.courierName,
    trackingId: order.courierTrackingCode,
  })
  const [activeTab, setActiveTab] = useState('details')
  const [note, setNote] = useState('')
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: auditLogs, isLoading: isLoadingAuditLogs } = useQuery({
    queryKey: ['audit-logs', order.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/audit-logs?orderId=${order.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }
      return response.json()
    },
    enabled: isOpen && activeTab === 'history',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (order && isOpen) {
      setEditableOrder({
        status: order.status,
        paymentStatus: order.paymentStatus,
        recipientName: order.recipientName ?? order.customer.name,
        recipientPhone: order.recipientPhone ?? order.customer.phone ?? '',
        deliveryAddress: order.deliveryAddress ?? order.customer.address,
        courierName: order.courierName,
        trackingId: order.courierTrackingCode,
      })
      setNote('')
    }
  }, [order, isOpen])

  const originalState = useMemo(() => ({
    status: order.status,
    paymentStatus: order.paymentStatus,
    recipientName: order.recipientName ?? order.customer.name,
    recipientPhone: order.recipientPhone ?? order.customer.phone ?? '',
    deliveryAddress: order.deliveryAddress ?? order.customer.address,
    courierName: order.courierName,
    trackingId: order.courierTrackingCode,
  }), [order])

  const hasChanges = !isEqual(originalState, editableOrder) || note.trim() !== ''

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<EditableOrderState> & { note?: string }) =>
      fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to save changes')
        }
        return res.json()
      }),
    onSuccess: () => {
      showToast.success('Order updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs', order.id] })
      router.refresh()
      setNote('')
    },
    onError: (error: Error) => {
      showToast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/admin/orders/${order.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      showToast.success('Order moved to trash.')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setIsOpen(false)
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to move order to trash.')
    },
  })

  const markAsFakeMutation = useMutation({
    mutationFn: (isFake: boolean) => 
      fetch(`/api/admin/orders/${order.id}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAsFake: isFake })
      }),
    onSuccess: (_, isFake) => {
      showToast.success(isFake ? 'Order marked as fake and user flagged.' : 'Order unmarked as fake.')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs', order.id] })
      router.refresh()
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update order.')
    },
  })

  const handleMarkAsFake = (isFake: boolean) => {
    const action = isFake ? 'unmark' : 'mark';
    const message = `Are you sure you want to ${action} this order as fake?${!isFake ? ' This will also flag the user.' : ''}`;
    
    if (window.confirm(message)) {
      markAsFakeMutation.mutate(!isFake);
    }
  }

  const isCancelling = editableOrder.status === 'CANCELED' && order.status !== 'CANCELED'

  const handleSaveChanges = () => {
    if (!hasChanges) return

    if (isCancelling) {
      if (!confirm('Are you sure you want to move this order to the trash?')) return
      deleteMutation.mutate()
      return
    }

    const changedData: Partial<EditableOrderState> = {}
    for (const key in editableOrder) {
      const typedKey = key as keyof EditableOrderState
      if (editableOrder[typedKey] !== originalState[typedKey]) {
        // @ts-ignore
        changedData[typedKey] = editableOrder[typedKey]
      }
    }

    const payload = { ...changedData, ...(note.trim() && { note: note.trim() }) }
    updateMutation.mutate(payload)
  }

  const handleFieldChange = (
    field: keyof EditableOrderState,
    value: string | null | OrderStatus | PaymentStatus
  ) => {
    setEditableOrder(
      produce((draft) => {
        (draft[field] as any) = value
      })
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" /> View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.orderNumber}</span>
            <div className="flex items-center gap-2">
              {order.isFakeOrder && (
                <Flag className="h-4 w-4 text-red-500" title="Fake Order" />
              )}
              {order.user?.isFlagged && (
                <span title="This user has been flagged" className="text-red-500">
                  <FileText className="h-4 w-4" />
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 h-[calc(95vh-150px)]">
          <div className="lg:col-span-2 min-h-0">
            <ScrollArea className="h-full pr-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">
                    <Info className="mr-2 h-4 w-4" /> Details
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="mr-2 h-4 w-4" />
                    Audit History
                  </TabsTrigger>
                </TabsList>
                <div className="mt-4">
                  <TabsContent value="details" className="space-y-6">
                    {/* Order Summary */}
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Package className="mr-2 h-5 w-5" /> Order Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <div className="font-medium">{format(new Date(order.createdAt), 'PPP p')}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <div className="font-medium text-lg">৳{order.total.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div><StatusBadge status={order.status} /></div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment:</span>
                          <div><StatusBadge status={order.paymentStatus} /></div>
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-3">
                      <h3 className="font-semibold">Order Items</h3>
                      <div className="rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-center">Quantity</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.product.name}</TableCell>
                                <TableCell className="text-center">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  ৳{item.price.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  ৳{(item.price * item.quantity).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Customer & Shipping */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center">
                        <User className="mr-2 h-5 w-5" /> Customer & Shipping Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium flex items-center">
                            <User className="mr-1 h-4 w-4" /> Name
                          </label>
                          <Input
                            value={editableOrder.recipientName}
                            onChange={(e) =>
                              handleFieldChange('recipientName', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium flex items-center">
                            <Phone className="mr-1 h-4 w-4" /> Phone
                          </label>
                          <Input
                            value={editableOrder.recipientPhone}
                            onChange={(e) =>
                              handleFieldChange('recipientPhone', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-span-full space-y-1">
                          <label className="text-sm font-medium flex items-center">
                            <MapPin className="mr-1 h-4 w-4" /> Shipping Address
                          </label>
                          <Textarea
                            value={editableOrder.deliveryAddress}
                            onChange={(e) =>
                              handleFieldChange('deliveryAddress', e.target.value)
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="history">
                    <div className="space-y-4">
                      {isLoadingAuditLogs ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : auditLogs && auditLogs.length > 0 ? (
                        <div className="space-y-4">
                          {auditLogs.map((log: AuditLogWithUser) => (
                            <AuditLogItem key={log.id} log={log} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-muted-foreground">
                          No history found for this order.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </ScrollArea>
          </div>
          <div className="lg:col-span-1 min-h-0">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="space-y-3 rounded-lg border p-4">
                  <h3 className="font-semibold">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant={order.isFakeOrder ? "secondary" : "outline"} 
                      size="sm" 
                      disabled={markAsFakeMutation.isPending} 
                      onClick={() => handleMarkAsFake(order.isFakeOrder || false)}
                      className="justify-start text-xs"
                    >
                      {order.isFakeOrder ? (
                        <>
                          <FlagOff className="mr-1 h-3 w-3" /> 
                          Unmark Fake
                        </>
                      ) : (
                        <>
                          <Flag className="mr-1 h-3 w-3" /> 
                          Mark Fake
                        </>
                      )}
                    </Button>
                    {!['SHIPPED', 'DELIVERED', 'CANCELED'].includes(order.status) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="justify-start text-xs"
                        onClick={() => {
                          // You can implement courier assignment logic here
                          showToast.info('Courier assignment feature coming soon!');
                        }}
                      >
                        <Truck className="mr-1 h-3 w-3" />
                        Assign Courier
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start text-xs"
                      onClick={() => {
                        // You can implement print invoice logic here
                        window.print();
                      }}
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Print Invoice
                    </Button>
                  </div>
                </div>

                {/* Statuses */}
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-semibold flex items-center">
                    <Package className="mr-2 h-5 w-5" /> Order Status
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Order Status</label>
                      <Select
                        value={editableOrder.status}
                        onValueChange={(v: OrderStatus) => handleFieldChange('status', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OrderStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                              <StatusBadge status={s} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Payment Status</label>
                      <Select
                        value={editableOrder.paymentStatus}
                        onValueChange={(v: PaymentStatus) => handleFieldChange('paymentStatus', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PaymentStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                              <StatusBadge status={s} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Courier */}
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-semibold flex items-center">
                    <Truck className="mr-2 h-5 w-5" /> Courier Details
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Courier</label>
                      <Input
                        placeholder="e.g. Steadfast"
                        value={editableOrder.courierName ?? ''}
                        onChange={(e) => handleFieldChange('courierName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Tracking ID</label>
                      <Input
                        placeholder="Courier Tracking ID"
                        value={editableOrder.trackingId ?? ''}
                        onChange={(e) => handleFieldChange('trackingId', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="space-y-3 rounded-lg border p-4">
                    <h3 className="font-semibold flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" /> Add a Note
                    </h3>
                    <Textarea
                        placeholder="Add a note for auditing purposes. This will be saved with any other changes..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || updateMutation.isPending || deleteMutation.isPending}
            variant={isCancelling ? 'destructive' : 'default'}
            className="flex-1 sm:flex-none"
          >
            {updateMutation.isPending || deleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isCancelling ? (
              'Move to Trash'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AuditLogItemProps = {
  log: AuditLogWithUser
}

function AuditLogItem({ log }: AuditLogItemProps) {
  const getIcon = () => {
    switch (log.action) {
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-500" />
      case 'NOTE':
        return <MessageSquare className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const formatValue = (field: string, value: string) => {
    if (!value) return <span className="text-gray-400 italic">empty</span>
    if (field.toLowerCase().includes('status')) {
      return <StatusBadge status={value as any} />
    }
    return <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{value}</span>
  }

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
      <div className="flex-shrink-0 pt-1">{getIcon()}</div>
      <div className="flex-grow min-w-0">
        <div className="text-sm">
          <strong className="text-foreground">{log.user.name ?? 'System'}</strong>
          {log.action === 'UPDATE' ? (
            <Fragment>
              {' updated '}
              <span className="font-semibold text-purple-600">{log.field}</span>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="text-xs text-muted-foreground">From:</span>
                {formatValue(log.field || '', log.oldValue || '')}
                <span className="text-xs text-muted-foreground">To:</span>
                {formatValue(log.field || '', log.newValue || '')}
              </div>
            </Fragment>
          ) : (
            <Fragment>
              {' added a note: '}
              <div className="mt-1 text-sm italic text-muted-foreground bg-muted/50 p-2 rounded">
                &ldquo;{log.newValue}&rdquo;
              </div>
            </Fragment>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {format(new Date(log.createdAt), 'MMM d, yyyy, h:mm a')}
        </div>
      </div>
    </div>
  )
} 