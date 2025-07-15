import Link from 'next/link'
import { getHomePageData } from '@/actions/home-actions'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const { featuredProducts } = await getHomePageData()

  return (
    <div className="container mx-auto text-center py-16">
      <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">Sorry, we couldn&apos;t find the product you&apos;re looking for.</p>
      <Button asChild>
        <Link href="/shop">Continue Shopping</Link>
      </Button>

      {featuredProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 