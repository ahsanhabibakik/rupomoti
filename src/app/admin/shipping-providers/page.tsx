'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

const providerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['pathao', 'redx', 'steadfast']),
  credentials: z.object({
    apiKey: z.string().min(1, 'API Key is required'),
    apiSecret: z.string().optional(),
    secretKey: z.string().optional(),
    storeId: z.string().optional(),
    webhookSecret: z.string().optional(),
  }),
  isActive: z.boolean(),
})

type ProviderFormData = z.infer<typeof providerSchema>

export default function ShippingProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<any>(null)
  const { toast } = useToast()

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      isActive: true,
      credentials: {},
    },
  })

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  const fetchProviders = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/shipping-providers')
      const data = await response.json()
      setProviders(data.providers)
    } catch (error) {
      console.error('Error fetching providers:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch shipping providers',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const onSubmit = async (data: ProviderFormData) => {
    try {
      const url = editingProvider ? `/api/admin/shipping-providers` : '/api/admin/shipping-providers'
      const method = editingProvider ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProvider ? { ...data, id: editingProvider.id } : data),
      })

      if (!response.ok) throw new Error('Failed to save provider')

      toast({
        title: 'Success',
        description: `Provider ${editingProvider ? 'updated' : 'created'} successfully`,
      })

      setIsOpen(false)
      fetchProviders()
      form.reset()
      setEditingProvider(null)
    } catch (error) {
      console.error('Error saving provider:', error)
      toast({
        title: 'Error',
        description: `Failed to ${editingProvider ? 'update' : 'create'} provider`,
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (provider: any) => {
    setEditingProvider(provider)
    form.reset({
      name: provider.name,
      code: provider.code,
      type: provider.type,
      credentials: provider.credentials || {},
      isActive: provider.isActive,
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return

    try {
      const response = await fetch(`/api/admin/shipping-providers?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete provider')

      toast({
        title: 'Success',
        description: 'Provider deleted successfully',
      })

      fetchProviders()
    } catch (error) {
      console.error('Error deleting provider:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete provider',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shipping Providers</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProvider(null)
              form.reset({
                name: '',
                code: '',
                type: 'steadfast',
                credentials: {},
                isActive: true,
              })
            }}>
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProvider ? 'Edit Provider' : 'Add Provider'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="steadfast">Steadfast</SelectItem>
                        <SelectItem value="redx">RedX</SelectItem>
                        <SelectItem value="pathao">Pathao</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credentials.apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('type') === 'pathao' && (
                <FormField
                  control={form.control}
                  name="credentials.apiSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Secret</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch('type') === 'steadfast' && (
                <FormField
                  control={form.control}
                  name="credentials.secretKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="credentials.storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credentials.webhookSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook Secret</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                {editingProvider ? 'Update' : 'Create'} Provider
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>{provider.name}</TableCell>
                  <TableCell>{provider.code}</TableCell>
                  <TableCell className="capitalize">{provider.type}</TableCell>
                  <TableCell>
                    <Switch
                      checked={provider.isActive}
                      onCheckedChange={async (checked) => {
                        try {
                          const response = await fetch('/api/admin/shipping-providers', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              ...provider,
                              isActive: checked,
                            }),
                          })

                          if (!response.ok) throw new Error('Failed to update status')

                          toast({
                            title: 'Success',
                            description: 'Provider status updated successfully',
                          })

                          fetchProviders()
                        } catch (error) {
                          console.error('Error updating status:', error)
                          toast({
                            title: 'Error',
                            description: 'Failed to update provider status',
                            variant: 'destructive',
                          })
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(provider)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(provider.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
