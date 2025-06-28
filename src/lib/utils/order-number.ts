// Generate smart, short order numbers (client-safe utilities)

// Helper function to validate order number format
export const isValidOrderNumber = (orderNumber: string): boolean => {
  return /^ORD-[A-Z]{3}[0-9]{3,}$/.test(orderNumber);
};

// Helper function to extract readable part
export const getOrderDisplayNumber = (orderNumber: string): string => {
  return orderNumber.replace('ORD-', '#');
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