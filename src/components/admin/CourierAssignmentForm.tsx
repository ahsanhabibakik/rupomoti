'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Order } from '@/types/mongoose-types';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const COURIER_OPTIONS = [
    { value: 'steadfast', label: 'Steadfast' },
    { value: 'redx', label: 'RedX' },
    { value: 'pathao', label: 'Pathao' },
    { value: 'carrybee', label: 'CarryBee' },
];

const assignmentSchema = z.object({
    courierName: z.enum(['steadfast', 'redx', 'pathao', 'carrybee']),
    recipientCity: z.string().min(1, 'A district must be selected'),
    recipientZone: z.string().min(1, 'A zone/upazila must be selected'),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface Location {
    id: string;
    name: string;
}

interface CourierAssignmentFormProps {
    order: Order & { customer: { city?: string | null, zone?: string | null } | null };
    onSuccess?: () => void;
}

export function CourierAssignmentForm({ order, onSuccess }: CourierAssignmentFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [districts, setDistricts] = useState<Location[]>([]);
    const [upazilas, setUpazilas] = useState<Location[]>([]);
    const [isFetchingUpazilas, setIsFetchingUpazilas] = useState(false);
    
    const { handleSubmit, control, watch, setValue, formState: { errors } } = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            courierName: (order.courierName as any) || 'steadfast',
            recipientCity: order.recipientCity || order.customer?.city || '',
            recipientZone: order.recipientZone || order.customer?.zone || '',
        },
    });

    // Fetch all districts on component mount
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const res = await fetch('/api/locations/districts');
                const data = await res.json();
                setDistricts(data.districts || []);
            } catch (error) {
                toast.error("Failed to load districts.");
            }
        };
        fetchDistricts();
    }, []);

    // Watch for changes in the selected district
    const watchedDistrict = watch('recipientCity');
    useEffect(() => {
        const fetchUpazilas = async () => {
            if (!watchedDistrict) {
                setUpazilas([]);
                return;
            };
            setIsFetchingUpazilas(true);
            try {
                const res = await fetch(`/api/locations/upazilas?district=${watchedDistrict}`);
                const data = await res.json();
                setUpazilas(data.upazilas || []);
                // Reset zone if the previously selected one is not in the new list
                const currentZone = watch('recipientZone');
                if (currentZone && !data.upazilas.some((u: Location) => u.name === currentZone)) {
                    setValue('recipientZone', '');
                }
            } catch (error) {
                toast.error("Failed to load upazilas for the selected district.");
            } finally {
                setIsFetchingUpazilas(false);
            }
        };
        fetchUpazilas();
    }, [watchedDistrict, setValue, watch]);

    const { mutate } = useSWRConfig();
    const onSubmit: SubmitHandler<AssignmentFormValues> = async (data) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.text(); // Use .text() to avoid JSON parse error on empty body
                try {
                    const jsonData = JSON.parse(errorData);
                    throw new Error(jsonData.error || 'Failed to update order');
                } catch (e) {
                    throw new Error(errorData || 'Failed to update order');
                }
            }
            toast.success('Order updated successfully!');
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader><CardTitle>Assign Courier for Order #{order.orderNumber}</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Controller name="courierName" control={control} render={({ field }) => (
                        <div>
                            <Label>Courier Service</Label>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select a courier" /></SelectTrigger>
                                <SelectContent>{COURIER_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    )} />
                    
                    <Controller name="recipientCity" control={control} render={({ field }) => (
                         <div>
                            <Label>Recipient District</Label>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select a district" /></SelectTrigger>
                                <SelectContent>{districts.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.recipientCity && <p className="text-red-500 text-sm mt-1">{errors.recipientCity.message}</p>}
                        </div>
                    )} />

                    <Controller name="recipientZone" control={control} render={({ field }) => (
                        <div>
                            <Label>Recipient Zone/Upazila</Label>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrict || isFetchingUpazilas}>
                                <SelectTrigger>
                                    <SelectValue placeholder={isFetchingUpazilas ? "Loading..." : "Select a zone/upazila"} />
                                </SelectTrigger>
                                <SelectContent>{upazilas.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors.recipientZone && <p className="text-red-500 text-sm mt-1">{errors.recipientZone.message}</p>}
                        </div>
                    )} />

                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Assignment
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
} 