export function getOrderDisplayNumber(orderNumber: string): string {
  // Extract meaningful parts from order number
  if (orderNumber.includes('RM-')) {
    return orderNumber; // Keep as is for RM- format
  }
  
  // For other formats, show last 8 characters with prefix
  if (orderNumber.length > 8) {
    return `#${orderNumber.slice(-8)}`;
  }
  
  return `#${orderNumber}`;
}

export function getOrderAnalytics(orders: any[]) {
  if (!Array.isArray(orders)) {
    return {
      total: 0,
      pending: 0,
      processing: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      fake: 0,
      newToday: 0,
      revenue: 0
    };
  }

  const today = new Date();
  const isToday = (date: string | Date) => {
    const d = new Date(date);
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    fake: orders.filter(o => o.isFakeOrder === true).length,
    newToday: orders.filter(o => isToday(o.createdAt)).length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
  };
}
