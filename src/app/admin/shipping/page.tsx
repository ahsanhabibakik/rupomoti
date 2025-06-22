'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShippingProviderForm } from '@/components/shipping/ShippingProviderForm';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit } from 'lucide-react';

interface ShippingProvider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  pathaoStoreId?: string;
  redxStoreId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ShippingProvidersPage() {
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/shipping/providers');
      const data = await res.json();
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipping providers',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;

    try {
      const res = await fetch(`/api/shipping/providers/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete provider');

      toast({
        title: 'Success',
        description: 'Provider deleted successfully',
      });

      fetchProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete provider',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (provider: ShippingProvider) => {
    setEditingProvider(provider);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProvider(null);
    fetchProviders();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shipping Providers</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hide Form' : 'Add Provider'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProvider ? 'Edit Provider' : 'Add New Provider'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShippingProviderForm 
              initialData={editingProvider}
              onSuccess={handleFormSuccess} 
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.length === 0 ? (
              <p className="text-muted-foreground">No shipping providers found</p>
            ) : (
              providers.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{provider.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        provider.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Type: {provider.type.toUpperCase()}
                      {provider.pathaoStoreId && ` • Store ID: ${provider.pathaoStoreId}`}
                      {provider.redxStoreId && ` • Store ID: ${provider.redxStoreId}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(provider)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(provider.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
