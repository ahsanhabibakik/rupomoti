import { prisma } from '@/lib/prisma';

// Function to generate a random alphanumeric string of a given length
const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Main function to generate a unique order number
export async function generateUniqueOrderNumber(): Promise<string> {
  const prefix = 'RM'; // Stands for Rupomoti
  const randomPartLength = 6;
  let orderNumber: string;
  let isUnique = false;

  // Keep generating a new number until it's unique
  while (!isUnique) {
    const randomPart = generateRandomString(randomPartLength);
    orderNumber = `${prefix}-${randomPart}`;
    
    // Check if the generated order number already exists in the database
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true }
    });

    if (!existingOrder) {
      isUnique = true;
    }
  }

  return orderNumber!;
} 