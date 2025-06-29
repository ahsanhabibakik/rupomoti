import { useQuery } from '@tanstack/react-query';

export interface OrderStatistics {
  total: number;
  pending: number;
  processing: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  fake: number;
  newToday: number;
  revenue: number;
  revenueToday: number;
  revenueYesterday?: number;
  revenueThisWeek?: number;
  revenueLastWeek?: number;
  revenueThisMonth?: number;
  revenueLastMonth?: number;
}

export function useOrderStatistics() {
  return useQuery<OrderStatistics>({
    queryKey: ['order-statistics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders/statistics', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch order statistics');
      }
      return response.json();
    },
    staleTime: 0, // Always consider stale to get fresh data
    refetchInterval: 30 * 1000, // refetch every 30 seconds
    refetchOnWindowFocus: true, // refetch when window gains focus
  });
}
