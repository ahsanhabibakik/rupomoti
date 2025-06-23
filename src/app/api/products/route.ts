import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { generateSKU, normalizeSKU } from '@/lib/utils/sku'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const categories = searchParams.getAll('categories')
    const minPrice = Number(searchParams.get('minPrice')) || 0
    const maxPrice = Number(searchParams.get('maxPrice')) || 100000
    const sort = searchParams.get('sort') || 'newest'

    // Build the where clause
    const where = {
      AND: [
        {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
        // Add category filter if categories are selected
        ...(categories.length > 0
          ? [
              {
                category: {
                  slug: {
                    in: categories,
                  },
                },
              },
            ]
          : []),
        // Add search filter if search term exists
        ...(search
          ? [
              {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } },
                ],
              },
            ]
          : []),
      ],
    }

    // Build the orderBy clause
    let orderBy = {}
    switch (sort) {
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()

    // Validate and normalize SKU if provided
    let sku: string | null = null;
    if (json.sku) {
      sku = normalizeSKU(json.sku);
      if (json.sku && !sku) {
        return NextResponse.json(
          { error: 'Invalid SKU format' },
          { status: 400 }
        );
      }
    }

    // Generate SKU if not provided or invalid
    if (!sku) {
      sku = await generateSKU(json.name, json.categoryId);
    }

    // Check if SKU already exists
    if (sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku },
      });

      if (existingProduct) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        name: json.name,
        description: json.description,
        price: json.price,
        salePrice: json.salePrice,
        images: json.images,
        mainImage: json.mainImage,
        featuredImage: json.featuredImage,
        sku,
        weight: json.weight,
        dimensions: json.dimensions,
        material: json.material,
        color: json.color,
        brand: json.brand,
        tags: json.tags,
        metaTitle: json.metaTitle,
        metaDescription: json.metaDescription,
        categoryId: json.categoryId,
        inStock: json.inStock ?? true,
        featured: json.featured ?? false,
        newArrival: json.newArrival ?? false,
        bestSeller: json.bestSeller ?? false,
        productLabel: json.productLabel || 'NONE',
        status: json.status || 'ACTIVE',
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { id } = json

    // Validate and normalize SKU if provided
    if (json.sku) {
      const normalizedSku = normalizeSKU(json.sku);
      if (!normalizedSku) {
        return NextResponse.json(
          { error: 'Invalid SKU format' },
          { status: 400 }
        );
      }

      // Check if SKU exists on another product
      const existingProduct = await prisma.product.findFirst({
        where: {
          sku: normalizedSku,
          id: { not: id }
        },
      });

      if (existingProduct) {
        return NextResponse.json(
          { error: 'SKU already exists on another product' },
          { status: 400 }
        );
      }

      json.sku = normalizedSku;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: json.name,
        description: json.description,
        price: json.price,
        salePrice: json.salePrice,
        images: json.images,
        mainImage: json.mainImage,
        featuredImage: json.featuredImage,
        sku: json.sku,
        weight: json.weight,
        dimensions: json.dimensions,
        material: json.material,
        color: json.color,
        brand: json.brand,
        tags: json.tags,
        metaTitle: json.metaTitle,
        metaDescription: json.metaDescription,
        categoryId: json.categoryId,
        inStock: json.inStock ?? true,
        featured: json.featured ?? false,
        newArrival: json.newArrival ?? false,
        bestSeller: json.bestSeller ?? false,
        productLabel: json.productLabel || 'NONE',
        status: json.status || 'ACTIVE',
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 