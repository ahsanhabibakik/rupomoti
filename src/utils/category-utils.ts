// Utility functions for category management

/**
 * Get default category image based on category name or slug
 */
export function getDefaultCategoryImage(categoryName: string): string {
  const name = categoryName.toLowerCase().trim()
  
  // Map of category keywords to default images
  const categoryImageMap: Record<string, string> = {
    'ring': '/images/categories/rings.svg',
    'rings': '/images/categories/rings.svg',
    'necklace': '/images/categories/necklaces.svg',
    'necklaces': '/images/categories/necklaces.svg',
    'earring': '/images/categories/earrings.svg',
    'earrings': '/images/categories/earrings.svg',
    'bracelet': '/images/categories/bracelets.svg',
    'bracelets': '/images/categories/bracelets.svg',
    'set': '/images/categories/sets.svg',
    'sets': '/images/categories/sets.svg',
    'jewelry set': '/images/categories/sets.svg',
    'jewellery set': '/images/categories/sets.svg',
  }

  // Find matching image
  for (const [keyword, imagePath] of Object.entries(categoryImageMap)) {
    if (name.includes(keyword)) {
      return imagePath
    }
  }

  // Return default image if no match found
  return '/images/categories/default.svg'
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false
  
  try {
    new URL(url)
    // Check if URL ends with common image extensions or is from known CDNs
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i
    const knownCDNs = /(cloudinary|imgur|unsplash|pexels|pixabay|amazonaws|googleapis)/i
    
    return imageExtensions.test(url) || knownCDNs.test(url)
  } catch {
    return false
  }
}

/**
 * Get fallback image for categories
 */
export function getCategoryImageWithFallback(imageUrl: string | null | undefined, categoryName: string = ''): string {
  if (imageUrl && isValidImageUrl(imageUrl)) {
    return imageUrl
  }
  
  return getDefaultCategoryImage(categoryName)
}
