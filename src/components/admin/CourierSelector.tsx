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

interface CourierSelectorProps {
  order: any;
  onShipmentCreated: () => void;
}

export function CourierSelector({ order, onShipmentCreated }: CourierSelectorProps) {
  const [selectedCourier, setSelectedCourier] = useState<CourierId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [areaInfo, setAreaInfo] = useState({ areaId: '', cityId: '', zoneId: '' });

  const handleCreateShipment = async () => {
    if (!selectedCourier) {
      toast.error('Please select a courier.');
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
          areaInfo,
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
          <div className="mt-4">
            <Label htmlFor="redx-area-id">RedX Delivery Area ID</Label>
            <Input
              id="redx-area-id"
              value={areaInfo.areaId}
              onChange={(e) => setAreaInfo({ ...areaInfo, areaId: e.target.value })}
              placeholder="e.g., 12345"
            />
          </div>
        );
      case 'pathao':
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="pathao-city-id">Pathao City ID</Label>
              <Input
                id="pathao-city-id"
                value={areaInfo.cityId}
                onChange={(e) => setAreaInfo({ ...areaInfo, cityId: e.target.value })}
                placeholder="e.g., 1"
              />
            </div>
            <div>
              <Label htmlFor="pathao-zone-id">Pathao Zone ID</Label>
              <Input
                id="pathao-zone-id"
                value={areaInfo.zoneId}
                onChange={(e) => setAreaInfo({ ...areaInfo, zoneId: e.target.value })}
                placeholder="e.g., 10"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Create Shipment</h3>
      <div className="flex items-end gap-4">
        <div className="flex-grow">
          <Label>Select Courier</Label>
          <Select onValueChange={(value) => setSelectedCourier(value as CourierId)} disabled={isLoading}>
            <SelectTrigger>
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
        <Button onClick={handleCreateShipment} disabled={isLoading || !selectedCourier}>
          {isLoading ? 'Creating...' : 'Create Shipment'}
        </Button>
      </div>
      {renderCourierInputs()}
    </div>
  );
} 