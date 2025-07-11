import { prisma } from '@/lib/prisma';
import { generateSmartOrderCode } from '@/lib/utils/order-number';

// Get next sequence number for scaling
const getNextSequence = async (): Promise<number> => {
  // Count total orders to determine current sequence
  const orderCount = await prisma.order.count();
  return orderCount + 1;
};

// Main function to generate a unique order number (server-side only)
export async function generateUniqueOrderNumber(): Promise<string> {
  const prefix = 'ORD';
  let baseLength = 6; // Start with 6 characters
  let orderNumber: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  // Get sequence number for potential scaling
  const sequence = await getNextSequence();
  
  // If we have many orders, scale up the length
  if (sequence > 999999) { // More than 999k orders
    baseLength = 7; // ORD-WER0001
  }
  if (sequence > 9999999) { // More than 9M orders  
    baseLength = 8; // ORD-WER00001
  }

  while (!isUnique && attempts < maxAttempts) {
    const smartCode = generateSmartOrderCode(baseLength);
    orderNumber = `${prefix}-${smartCode}`;
    
    // Check if the generated order number already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true }
    });

    if (!existingOrder) {
      isUnique = true;
    } else {
      attempts++;
      // If too many collisions, increase length automatically
      if (attempts >= maxAttempts / 2) {
        baseLength++;
      }
    }
  }

  // Fallback with timestamp if still not unique (very rare)
  if (!isUnique) {
    const timestamp = Date.now().toString().slice(-6);
    orderNumber = `${prefix}-${timestamp}`;
  }

  return orderNumber!;
}
