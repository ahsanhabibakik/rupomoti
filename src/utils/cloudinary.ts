"use client";

/**
 * Helper function to optimize Cloudinary URLs with transformations
 * 
 * @param url The original Cloudinary URL
 * @param width Desired width
 * @param height Desired height (optional)
 * @param options Additional transformations
 * @returns Optimized Cloudinary URL
 */
export function optimizeCloudinaryUrl(
  url: string,
  width: number,
  height?: number,
  options?: {
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'png' | 'jpg';
    crop?: 'fill' | 'scale' | 'fit';
    effect?: string;
  }
): string {
  // If it's not a Cloudinary URL, return as is
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }
  
  // If it's an SVG file, don't apply transformations to maintain vector quality
  if (url.toLowerCase().endsWith('.svg')) {
    return url;
  }

  try {
    // Extract base URL and file path
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const [baseUrl, filePath] = parts;
    
    // Build transformation string
    const transformations = [
      `w_${width}`,
      height ? `h_${height}` : '',
      options?.crop ? `c_${options.crop}` : 'c_limit',
      options?.quality ? `q_${options.quality}` : 'q_auto',
      options?.format ? `f_${options.format}` : 'f_auto',
      options?.effect || '',
    ].filter(Boolean).join(',');

    // Return optimized URL
    return `${baseUrl}/upload/${transformations}/${filePath}`;
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error);
    return url;
  }
}

/**
 * Helper function to check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return !!url && typeof url === 'string' && url.includes('res.cloudinary.com');
}
