import { prisma } from '@/lib/prisma';

/**
 * Validates a SKU format
 * Valid formats:
 * - CAT-NAME-RANDOM (e.g., NKL-PEARL-123ABC)
 * - PRD-TIMESTAMP-RND (fallback format)
 */
export function isValidSKU(sku: string): boolean {
  // Regular expressions for both formats
  const standardFormat = /^[A-Z]{3}-[A-Z]{1,5}-[A-Z0-9]{6}$/;
  const fallbackFormat = /^PRD-\d+-[A-Z0-9]{3}$/;

  return standardFormat.test(sku) || fallbackFormat.test(sku);
}

/**
 * Generates a unique SKU for a product based on its name and category
 * Format: CAT-NAME-RANDOM
 * Example: NKL-PEARL-123ABC
 */
export async function generateSKU(name: string, categoryId: string): Promise<string> {
  try {
    // Get the category
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Generate category prefix (first 3 letters uppercase)
    const categoryPrefix = category.name
      .replace(/[^a-zA-Z]/g, '') // Remove non-letters
      .substring(0, 3)
      .toUpperCase();

    // Generate name part (first 5 letters uppercase)
    const namePart = name
      .replace(/[^a-zA-Z]/g, '') // Remove non-letters
      .substring(0, 5)
      .toUpperCase();

    // Generate random suffix (6 characters)
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Combine parts with hyphens
    const sku = `${categoryPrefix}-${namePart}-${randomSuffix}`;

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    // If SKU exists, generate a new one recursively
    if (existingProduct) {
      return generateSKU(name, categoryId);
    }

    return sku;
  } catch (error) {
    console.error('Error generating SKU:', error);
    // Fallback SKU format if something goes wrong
    return `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  }
}

/**
 * Generates SKUs for products that don't have one
 * @returns Object containing success count and any errors
 */
export async function generateMissingSKUs() {
  const results = {
    success: 0,
    errors: [] as string[],
    total: 0,
  };

  try {
    // Find all products without SKUs
    const products = await prisma.product.findMany({
      where: {
        sku: null,
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
      },
    });

    results.total = products.length;

    // Generate SKUs for each product
    for (const product of products) {
      try {
        const sku = await generateSKU(product.name, product.categoryId);
        
        await prisma.product.update({
          where: { id: product.id },
          data: { sku },
        });

        results.success++;
      } catch (error) {
        results.errors.push(`Failed to generate SKU for product ${product.id}: ${error.message}`);
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to generate missing SKUs: ${error.message}`);
  }
}

/**
 * Validates and normalizes a SKU
 * @returns Normalized SKU or null if invalid
 */
export function normalizeSKU(sku: string): string | null {
  if (!sku) return null;

  // Remove any whitespace and convert to uppercase
  const normalizedSKU = sku.trim().toUpperCase();

  // Validate the normalized SKU
  if (!isValidSKU(normalizedSKU)) {
    return null;
  }

  return normalizedSKU;
} 