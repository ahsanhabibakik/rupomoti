export function generateSKU(productName: string): string {
  const sanitizedName = productName
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with dashes

  const uniquePart = Date.now().toString(36).slice(-4).toUpperCase();

  return `${sanitizedName.slice(0, 10)}-${uniquePart}`;
} 