'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface ShippingProviderFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function ShippingProviderForm({ onSuccess, initialData }: ShippingProviderFormProps) {
  const [type, setType] = useState(initialData?.type || 'pathao');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    isActive: initialData?.isActive ?? true,
    apiKey: '',
    apiSecret: '',
    storeId: initialData?.pathaoStoreId || initialData?.redxStoreId || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = initialData 
        ? `/api/shipping/providers/${initialData.id}`
        : '/api/shipping/providers';

      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save provider');
      }

      toast({
        title: 'Success',
        description: `Provider ${initialData ? 'updated' : 'created'} successfully`
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to save provider',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Provider Type</Label>
        <Select value={type} onValueChange={setType} disabled={!!initialData}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pathao">Pathao</SelectItem>
            <SelectItem value="redx">RedX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      {type === 'pathao' && (
        <>
          <div>
            <Label>API Key</Label>
            <Input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
              placeholder={initialData ? '••••••••••••' : ''}
              required={!initialData}
            />
          </div>
          <div>
            <Label>API Secret</Label>
            <Input
              type="password"
              value={formData.apiSecret}
              onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
              placeholder={initialData ? '••••••••••••' : ''}
              required={!initialData}
            />
          </div>
        </>
      )}

      {type === 'redx' && (
        <div>
          <Label>API Key</Label>
          <Input
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
            placeholder={initialData ? '••••••••••••' : ''}
            required={!initialData}
          />
        </div>
      )}

      <div>
        <Label>{type === 'pathao' ? 'Store ID' : 'Store ID (Optional)'}</Label>
        <Input
          value={formData.storeId}
          onChange={(e) => setFormData({...formData, storeId: e.target.value})}
          required={type === 'pathao' && !initialData}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Provider'}
      </Button>
    </form>
  );
}
