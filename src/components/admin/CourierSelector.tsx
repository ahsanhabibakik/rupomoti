'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COURIERS, CourierId } from '@/lib/couriers';
import { toast } from 'sonner';
import { Loader2, Truck } from 'lucide-react';

interface CourierSelectorProps {
  order: any;
  onShipmentCreated: () => void;
}

export function CourierSelector({ order, onShipmentCreated }: CourierSelectorProps) {
  const [selectedCourier, setSelectedCourier] = useState<CourierId | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [areaInfo, setAreaInfo] = useState({ areaId: '', areaName: '', cityId: '', zoneId: '' });

  const handleCreateShipment = async () => {
    if (!selectedCourier) {
      toast.error('Please select a courier.');
      return;
    }

    // Validate required fields based on courier
    if (selectedCourier === 'redx' && (!areaInfo.areaId || !areaInfo.areaName)) {
      toast.error('Please enter both RedX Delivery Area ID and Area Name.');
      return;
    }

    if (selectedCourier === 'pathao' && (!areaInfo.cityId || !areaInfo.zoneId)) {
      toast.error('Please enter both Pathao City ID and Zone ID.');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Creating shipment...');

    try {
      const response = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          courierId: selectedCourier,
          areaInfo: {
            // Send snake_case to the backend as requested
            area_id: areaInfo.areaId ? Number(areaInfo.areaId) : undefined,
            area_name: areaInfo.areaName,
            cityId: areaInfo.cityId,
            zoneId: areaInfo.zoneId,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create shipment.');
      }

      toast.success('Shipment created successfully!', { id: toastId });
      onShipmentCreated();
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCourierInputs = () => {
    switch (selectedCourier) {
      case 'redx':
        return (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="redx-area-id" className="text-sm font-medium">
                RedX Delivery Area ID *
              </Label>
              <Input
                id="redx-area-id"
                value={areaInfo.areaId}
                onChange={(e) => setAreaInfo({ ...areaInfo, areaId: e.target.value })}
                placeholder="e.g., 12345"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="redx-area-name" className="text-sm font-medium">
                RedX Delivery Area Name *
              </Label>
              <Input
                id="redx-area-name"
                value={areaInfo.areaName}
                onChange={(e) => setAreaInfo({ ...areaInfo, areaName: e.target.value })}
                placeholder="e.g., Mirpur"
                disabled={isLoading}
              />
            </div>
          </div>
        );
      case 'pathao':
        return (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pathao-city-id" className="text-sm font-medium">
                  Pathao City ID *
                </Label>
                <Input
                  id="pathao-city-id"
                  value={areaInfo.cityId}
                  onChange={(e) => setAreaInfo({ ...areaInfo, cityId: e.target.value })}
                  placeholder="e.g., 1"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="pathao-zone-id" className="text-sm font-medium">
                  Pathao Zone ID *
                </Label>
                <Input
                  id="pathao-zone-id"
                  value={areaInfo.zoneId}
                  onChange={(e) => setAreaInfo({ ...areaInfo, zoneId: e.target.value })}
                  placeholder="e.g., 10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the Pathao city and zone IDs for the customer&apos;s location
            </p>
          </div>
        );
      case 'steadfast':
        return (
          <div className="mt-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Steadfast courier will use the customer&apos;s address automatically. No additional configuration needed.
              </p>
            </div>
          </div>
        );
      case 'carrybee':
        return (
          <div className="mt-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                CarryBee integration is not yet implemented.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Create Shipment</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="courier-select" className="text-sm font-medium">
            Select Courier Service *
          </Label>
          <Select 
            value={selectedCourier} 
            onValueChange={(value) => setSelectedCourier(value as CourierId)} 
            disabled={isLoading}
          >
            <SelectTrigger id="courier-select" className="w-full">
              <SelectValue placeholder="Choose a courier service" />
            </SelectTrigger>
            <SelectContent>
              {COURIERS.map((courier) => (
                <SelectItem key={courier.id} value={courier.id}>
                  {courier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderCourierInputs()}

        <div className="flex justify-end">
          <Button 
            onClick={handleCreateShipment} 
            disabled={isLoading || !selectedCourier}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Create Shipment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 