import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for validating category creation
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

// Schema for validating category updates
const updateCategorySchema = createCategorySchema.extend({
  id: z.string(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const getAll = searchParams.get('all');

  try {
    if (getAll === 'true') {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      
      const simplifiedCategories = categories.map(category => ({
        id: category.id,
        name: category.name,
      }));

      return NextResponse.json({ categories: simplifiedCategories });
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CATEGORIES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = createCategorySchema.safeParse(body)

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: 'Invalid input', details: validation.error.flatten() }), { status: 400 })
    }

    const { name, slug, parentId } = validation.data

    // Check for unique name and slug
    const existingCategory = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    })

    if (existingCategory) {
      return new NextResponse(JSON.stringify({ error: 'A category with this name or slug already exists.' }), { status: 409 })
    }

    // Check if parent category exists
    if (parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
      })
      if (!parentExists) {
        return new NextResponse(JSON.stringify({ error: 'Parent category not found.' }), { status: 400 })
      }
    }

    const category = await prisma.category.create({
      data: validation.data,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('[CATEGORIES_POST]', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const validation = updateCategorySchema.safeParse(body)

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: 'Invalid input', details: validation.error.flatten() }), { status: 400 })
    }

    const { id, name, slug, parentId } = validation.data

    // Check for unique name and slug (excluding the current category)
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
        NOT: { id },
      },
    })

    if (existingCategory) {
      return new NextResponse(JSON.stringify({ error: 'A category with this name or slug already exists.' }), { status: 409 })
    }
    
    // Prevent a category from being its own parent
    if (id === parentId) {
      return new NextResponse(JSON.stringify({ error: 'A category cannot be its own parent.' }), { status: 400 })
    }

    // Check if parent category exists
    if (parentId) {
      const parentExists = await prisma.category.findUnique({ where: { id: parentId } })
      if (!parentExists) {
        return new NextResponse(JSON.stringify({ error: 'Parent category not found.' }), { status: 400 })
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: validation.data,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('[CATEGORIES_PUT]', error)
    // Handle cases where the category to update doesn't exist
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
       return new NextResponse(JSON.stringify({ error: 'Category not found' }), { status: 404 })
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Category ID is required' }), { status: 400 })
    }

    // Check if the category has any associated products
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    })

    if (productCount > 0) {
      return new NextResponse(
        JSON.stringify({ error: `Cannot delete category with ${productCount} associated products.` }),
        { status: 409 }
      )
    }
    
    // Check if the category has any sub-categories
    const subCategoryCount = await prisma.category.count({
      where: { parentId: id },
    })

    if (subCategoryCount > 0) {
      return new NextResponse(
        JSON.stringify({ error: `Cannot delete category with ${subCategoryCount} sub-categories.` }),
        { status: 409 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[CATEGORIES_DELETE]', error)
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
       return new NextResponse(JSON.stringify({ error: 'Category not found' }), { status: 404 })
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
} 