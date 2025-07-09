import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getMongoClient() {
  const client = new MongoClient(process.env.DATABASE_URL!, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  await client.connect()
  return client
}

export async function GET(request: Request) {
  let client: MongoClient | null = null
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    client = await getMongoClient()
    const db = client.db()
    const productsCollection = db.collection('Product')

    // Build query filter
    const filter: Record<string, unknown> = {}
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'seo.keywords': { $regex: search, $options: 'i' } }
      ]
    }

    if (category) {
      filter.categoryId = category
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {}
      if (minPrice) priceFilter.$gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice)
      filter.price = priceFilter
    }

    // Only show active products
    filter.status = 'ACTIVE'

    // Get total count
    const totalProducts = await productsCollection.countDocuments(filter)

    // Build sort object
    const sort: Record<string, 1 | -1> = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Get products with pagination
    const products = await productsCollection
      .find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()

    // Transform products to match expected format
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description || null,
      price: product.price || 0,
      compareAtPrice: product.compareAtPrice || null,
      sku: product.sku || null,
      barcode: product.barcode || null,
      slug: product.slug,
      images: product.images || [],
      featuredImage: product.featuredImage || null,
      isActive: product.isActive || true,
      isFeatured: product.isFeatured || false,
      categoryId: product.categoryId || null,
      stock: product.stock || 0,
      lowStockThreshold: product.lowStockThreshold || 5,
      weight: product.weight || null,
      dimensions: product.dimensions || null,
      tags: product.tags || [],
      seo: product.seo || {},
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: null as { id: string; name: string; slug: string } | null // Will be populated if needed
    }))

    // Get category information if products have categoryId
    const categoryIds = [...new Set(transformedProducts.map(p => p.categoryId).filter(Boolean))]
    
    if (categoryIds.length > 0) {
      const categories = await db.collection('Category')
        .find({ _id: { $in: categoryIds.map(id => id) } })
        .toArray()
      
      const categoryMap = new Map(categories.map(cat => [cat._id.toString(), cat]))
      
      transformedProducts.forEach(product => {
        if (product.categoryId) {
          const category = categoryMap.get(product.categoryId)
          if (category) {
            product.category = {
              id: category._id.toString(),
              name: category.name,
              slug: category.slug
            }
          }
        }
      })
    }

    const totalPages = Math.ceil(totalProducts / pageSize)

    await client.close()

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        pageSize,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })

  } catch (error) {
    console.error('Products API Error:', error)
    
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError)
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  let client: MongoClient | null = null
  
  try {
    const body = await request.json()
    client = await getMongoClient()
    const db = client.db()
    const collection = db.collection('Product')
    
    // Generate unique slug if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    
    // Add timestamps
    const now = new Date()
    body.createdAt = now
    body.updatedAt = now
    
    const result = await collection.insertOne(body)
    
    return NextResponse.json({
      success: true,
      data: { ...body, id: result.insertedId.toString() }
    })
    
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product', message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  } finally {
    if (client) {
      try {
        await client.close()
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError)
      }
    }
  }
}
