import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductDetails } from './_components/product-details'
import { ReviewSection } from './_components/review-section'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  })

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    }
  }

  return {
    title: `${product.name} - Rupomoti`,
    description: product.description || `Discover ${product.name} from our premium pearl jewelry collection.`,
    openGraph: {
      title: `${product.name} - Rupomoti`,
      description: product.description || `Discover ${product.name} from our premium pearl jewelry collection.`,
      images: [
        {
          url: product.images[0] || '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <>
      <ProductDetails product={product} />
      <div className="container mx-auto px-4 py-8">
        <ReviewSection
          productId={product.id}
          productSlug={product.slug}
          initialReviews={product.reviews}
        />
      </div>
    </>
  )
} 