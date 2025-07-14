import { NextResponse } from 'next/server'



export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '6')
    
    // Fetch featured products for landing page
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { isFeatured: true },
          { isPopular: true },
          { isNewArrival: true }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        images: true,
        description: true,
        isFeatured: true,
        isPopular: true,
        isNewArrival: true,
        stock: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform products for landing page use
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      originalPrice: product.salePrice ? product.price : undefined,
      discount: product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : undefined,
      image: product.images[0] || '/images/placeholder.jpg',
      features: [
        '১০০% অরিজিনাল',
        'ফ্রি ডেলিভারি',
        'ক্যাশ অন ডেলিভারি'
      ],
      badge: product.isNewArrival ? 'নতুন' : product.isFeatured ? 'ফিচার্ড' : product.isPopular ? 'জনপ্রিয়' : undefined,
      buttonText: 'অর্ডার করুন',
      stock: product.stock
    }))

    return NextResponse.json({
      success: true,
      products: transformedProducts
    })
  } catch (error) {
    console.error('Failed to fetch landing page products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}