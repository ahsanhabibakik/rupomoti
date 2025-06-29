import { ProductCard } from '@/components/products/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { Sparkles, Clock, Star, Filter, Grid, List } from 'lucide-react'
import { Suspense } from 'react'
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton'

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
          category: {
            select: { name: true, slug: true }
          }
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
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function NewArrivalsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 24
  const category = searchParams.category as string | undefined
  const sort = searchParams.sort as string | undefined

  const { products: newArrivals, total, hasMore } = await getNewArrivals(page, limit, category, sort)
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              New Arrivals
            </Badge>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Latest Jewelry Collection
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover our newest jewelry pieces, featuring exquisite designs and timeless elegance.
            Each piece is carefully crafted to perfection, bringing you the latest trends in fine jewelry.
          </p>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Fresh arrivals daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Premium quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Limited editions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 pb-16">
        {newArrivals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No New Arrivals Yet</h3>
              <p>Check back soon for our latest jewelry pieces!</p>
            </div>
            <Button asChild className="mt-4">
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Newest Additions ({newArrivals.length})
                </h2>
                <p className="text-muted-foreground">
                  Explore our latest collection of handcrafted jewelry
                </p>
              </div>
              
              <Button variant="outline" asChild>
                <Link href="/shop">View All Products</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-green-500 text-white shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  </div>
                  
                  <ProductCard 
                    product={product}
                    className="hover:shadow-xl transition-all duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Pagination and Load More Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-12">
              <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                Showing {Math.min((page - 1) * limit + 1, total)} - {Math.min(page * limit, total)} of {total} results
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  disabled={page === 1} 
                  onClick={() => {
                    const newPage = page - 1
                    router.push(`?page=${newPage}&limit=${limit}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}`)
                  }}
                >
                  Previous
                </Button>
                
                <Button 
                  variant="outline" 
                  disabled={!hasMore} 
                  onClick={() => {
                    const newPage = page + 1
                    router.push(`?page=${newPage}&limit=${limit}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}`)
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}