import { ProductCard } from '@/components/products/ProductCard';
import { prisma } from '@/lib/prisma';
import { ShopClientPage } from './ShopClientPage';

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
  return products;
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return categories;
}

export default async function ShopPage() {
  const initialProducts = await getProducts();
  const categories = await getCategories();

  return (
    <ShopClientPage initialProducts={initialProducts} categories={categories} />
  );
} 