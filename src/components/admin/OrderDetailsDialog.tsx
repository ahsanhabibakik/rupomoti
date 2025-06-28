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
} from 'lucide-react'

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: { customer: true; items: { include: { product: true } } }
}>

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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Order #{order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ScrollArea className="h-[calc(80vh-150px)] pr-6">
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
                    {/* Items Table */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">Order Items</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product.name}</TableCell>
                              <TableCell className="text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                ৳{item.price.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Customer & Shipping */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Customer & Shipping</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={editableOrder.recipientName}
                            onChange={(e) =>
                              handleFieldChange('recipientName', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Phone</label>
                          <Input
                            value={editableOrder.recipientPhone}
                            onChange={(e) =>
                              handleFieldChange('recipientPhone', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-span-full space-y-1">
                          <label className="text-sm font-medium">
                            Shipping Address
                          </label>
                          <Textarea
                            value={editableOrder.deliveryAddress}
                            onChange={(e) =>
                              handleFieldChange('deliveryAddress', e.target.value)
                            }
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
                        <div className="space-y-4 pr-4">
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
          <div className="md:col-span-1 space-y-6">
            <ScrollArea className="h-[calc(80vh-150px)] pr-2">
              <div className="space-y-6">
                {/* Statuses */}
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-semibold flex items-center">
                    <Package className="mr-2 h-5 w-5" /> Order Status
                  </h3>
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

                {/* Courier */}
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-semibold flex items-center">
                    <Truck className="mr-2 h-5 w-5" /> Courier Details
                  </h3>
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
                
                {/* Notes */}
                <div className="space-y-2 rounded-lg border p-4">
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
        <DialogFooter className="mt-6">
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || updateMutation.isPending || deleteMutation.isPending}
            variant={isCancelling ? 'destructive' : 'default'}
          >
            {updateMutation.isPending || deleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isCancelling ? (
              'Move to Trash'
            ) : (
              'Save Changes'
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
    return <span className="font-mono text-xs">{value}</span>
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 pt-1">{getIcon()}</div>
      <div className="flex-grow">
        <div className="text-sm">
          <strong>{log.user.name ?? 'System'}</strong>
          {log.action === 'UPDATE' ? (
            <Fragment>
              {' updated '}
              <span className="font-semibold text-purple-600">{log.field}</span>
              {' from '}{formatValue(log.field, log.oldValue)}
              {' to '}{formatValue(log.field, log.newValue)}
            </Fragment>
          ) : (
            <Fragment>
              {' added a note: '}
              <em className="text-gray-600">&ldquo;{log.newValue}&rdquo;</em>
            </Fragment>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {format(new Date(log.createdAt), 'MMM d, yyyy, h:mm a')}
        </div>
      </div>
    </div>
  )
} 