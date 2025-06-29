// Generate smart, short order numbers (client-safe utilities)

// Helper function to validate order number format
export const isValidOrderNumber = (orderNumber: string): boolean => {
  return /^ORD-[A-Z]{3}[0-9]{3,}$/.test(orderNumber);
};

// Helper function to extract readable part
export const getOrderDisplayNumber = (orderNumber: string): string => {
  return orderNumber.replace('ORD-', '#');
};

// Get compact order number for mobile/small displays
export const getCompactOrderNumber = (orderNumber: string): string => {
  const display = getOrderDisplayNumber(orderNumber);
  // For very long order numbers, show first 3 and last 3 characters with dots
  if (display.length > 10) {
    return display.slice(0, 6) + '...' + display.slice(-3);
  }
  return display;
};

// Get analytical order number info
export const getOrderAnalyticalInfo = (order: {
  orderNumber: string;
  createdAt: string | Date;
  status: string;
  isFakeOrder?: boolean;
}) => {
  const hoursSinceCreated = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60));
  const isNew = hoursSinceCreated < 24;
  const isVeryNew = hoursSinceCreated < 2;
  
  return {
    displayNumber: getOrderDisplayNumber(order.orderNumber),
    compactNumber: getCompactOrderNumber(order.orderNumber),
    isNew,
    isVeryNew,
    hoursSinceCreated,
    statusInfo: {
      isPending: order.status === 'PENDING',
      isFake: order.isFakeOrder === true,
      isCompleted: ['DELIVERED', 'SHIPPED'].includes(order.status),
      isCancelled: order.status === 'CANCELLED'
    }
  };
};

// Generate smart order code (client-safe)
export const generateSmartOrderCode = (length: number = 6): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  // Start with 3 letters, then 3 numbers for better readability
  let result = '';
  
  // Add letters first (3 chars)
  for (let i = 0; i < Math.min(3, length); i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Add numbers (remaining chars)
  for (let i = 3; i < length; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return result;
}; 