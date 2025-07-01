import { prisma } from '@/lib/prisma';

/**
 * Convert a string to a URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Generate a unique slug for a product using existing slugs array (client-side safe)
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Generate a unique slug for a product (server-side with database check)
 * @param name The product name to create a slug from
 * @param existingSlug Optional existing slug to check (for updates)
 * @returns A unique slug that doesn't exist in the database
 */
export async function generateUniqueSlugFromDB(name: string, existingSlug?: string): Promise<string> {
  const baseSlug = generateSlug(name);
  
  // If we have an existing slug and it's the same as the base slug, keep it
  if (existingSlug && existingSlug === baseSlug) {
    return existingSlug;
  }
  
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  // Check if the slug already exists in the database
  while (true) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true, slug: true }
    });
    
    // If no product found with this slug, it's unique
    if (!existingProduct) {
      break;
    }
    
    // If we're updating an existing product and the slug belongs to it, keep it
    if (existingSlug && existingProduct.slug === existingSlug) {
      break;
    }
    
    // Otherwise, try with a counter suffix
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
    
    // Safety check to prevent infinite loops
    if (counter > 1000) {
      throw new Error('Unable to generate unique slug after 1000 attempts');
    }
  }
  
  return uniqueSlug;
}

/**
 * Validate if a slug is properly formatted
 */
export function validateSlug(slug: string): boolean {
  // Check if slug contains only valid characters (lowercase letters, numbers, hyphens)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Check if a slug is available (not taken by another product)
 * @param slug The slug to check
 * @param excludeProductId Optional product ID to exclude from the check (for updates)
 * @returns true if the slug is available, false if it's taken
 */
export async function isSlugAvailable(slug: string, excludeProductId?: string): Promise<boolean> {
  const existingProduct = await prisma.product.findUnique({
    where: { slug },
    select: { id: true }
  });
  
  // If no product found, slug is available
  if (!existingProduct) {
    return true;
  }
  
  // If we're checking for an update and the slug belongs to the same product, it's available
  if (excludeProductId && existingProduct.id === excludeProductId) {
    return true;
  }
  
  return false;
} 