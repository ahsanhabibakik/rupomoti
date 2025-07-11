// ISR: Revalidate new arrivals every 6 hours
export const revalidate = 21600
export const dynamic = 'auto'

import { ProductCard } from '@/components/products/ProductCard'
import { Badge } from '@/components/ui/badge'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { Sparkles, Clock, Star, Filter, Grid, List } from 'lucide-react'
import { Suspense } from 'react'
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton'
import NewArrivalsPagination from '@/components/pagination/NewArrivalsPagination'
import SortSelector from '@/components/ui/SortSelector'

const prisma = new PrismaClient()

interface PageProps {
  searchParams: {
    page?: string
    limit?: string
    category?: string
    sort?: string
  }
}

async function getNewArrivals(page = 1, limit = 24, category?: string, sort = 'createdAt') {
  try {
    const skip = (page - 1) * limit
    
    const whereClause = {
      status: 'ACTIVE' as const,
      stock: { gt: 0 },
      isNewArrival: true,
      ...(category && { category: { slug: category } })
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true
        },
        orderBy: sort === 'price' ? { price: 'asc' } : 
                 sort === 'name' ? { name: 'asc' } : 
                 { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where: whereClause })
    ])

    return { products, total, hasMore: skip + limit < total }
  } catch (error) {
    console.error('Error fetching new arrivals:', error)
    return { products: [], total: 0, hasMore: false }
  } finally {
    await prisma.$disconnect()
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function NewArrivalsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const limit = Number(resolvedSearchParams.limit) || 24
  const category = resolvedSearchParams.category as string | undefined
  const sort = resolvedSearchParams.sort as string | undefined

  const { products: newArrivals, total, hasMore } = await getNewArrivals(page, limit, category, sort)
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-12 sm:py-16 mb-8 sm:mb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
            <Badge variant="secondary" className="text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2">
              New Arrivals
            </Badge>
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
          </div>
          
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 bg-clip-text text-transparent font-bold" 
                  style={{
                    background: 'linear-gradient(135deg, #D97706, #F59E0B, #B45309)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: '#4A2E21' // fallback color
                  }}>
              Latest Jewelry Collection
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Discover our newest jewelry pieces, featuring exquisite designs and timeless elegance.
            Each piece is carefully crafted to perfection, bringing you the latest trends in fine jewelry.
          </p>

          <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Fresh arrivals daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Premium quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Limited editions</span>
            </div>
          </div>

          {/* Quick Filter Links */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
            <Link 
              href="/new-arrivals" 
              className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
            >
              All New
            </Link>
            {categories.slice(0, 4).map((cat) => (
              <Link 
                key={cat.id}
                href={`/new-arrivals?category=${cat.slug}`}
                className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground bg-muted/50 rounded-full hover:bg-muted hover:text-foreground transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 pb-16">
        {newArrivals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No New Arrivals Yet</h3>
              <p className="text-sm sm:text-base">Check back soon for our latest jewelry pieces!</p>
            </div>
            <Link 
              href="/shop"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            {/* Sort and Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {Math.min((page - 1) * limit + 1, total)} - {Math.min(page * limit, total)} of {total} products</span>
              </div>
              
              <div className="flex items-center gap-2">
                <SortSelector currentSort={sort} />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {newArrivals.map((product) => (
                <div key={product.id} className="group">
                  <ProductCard 
                    product={product}
                    className="hover:shadow-xl transition-all duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <NewArrivalsPagination 
              page={page}
              limit={limit}
              category={category}
              sort={sort}
              hasMore={hasMore}
              total={total}
            />
          </>
        )}
      </div>
    </div>
  )
}
