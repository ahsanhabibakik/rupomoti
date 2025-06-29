import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  orders: Order[];
};

export function useCustomers(searchTerm: string) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/customers?search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchCustomers = useMemo(() => 
    debounce(fetchCustomers, 300),
    [fetchCustomers]
  );

  useEffect(() => {
    debouncedFetchCustomers(searchTerm);
  }, [searchTerm, debouncedFetchCustomers]);

  return { customers, loading, error };
} 