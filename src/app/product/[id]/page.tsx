import { Metadata } from 'next'
import { ProductDetails } from '@/components/products/ProductDetails'
import productsData from '@/data/products.json'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = productsData.products.find(p => p.id === params.id)

  return {
    title: product ? `${product.name} - Rupomoti` : 'Product Not Found - Rupomoti',
    description: product?.description || 'Product not found',
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const product = productsData.products.find(p => p.id === params.id)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
      </div>
    )
  }

  return <ProductDetails product={product} />
} 