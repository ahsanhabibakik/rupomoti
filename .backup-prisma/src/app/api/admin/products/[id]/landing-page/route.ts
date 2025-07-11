import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// GET - Fetch landing page data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Optimized query with only necessary fields
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        designType: true,
        useCustomLandingPage: true,
        landingPageData: true,
        landingPageSections: true,
        landingPageDraft: true,
        landingPagePublished: true,
        updatedAt: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        designType: product.designType,
        useCustomLandingPage: product.useCustomLandingPage,
        landingPageData: product.landingPageData,
        landingPageSections: product.landingPageSections,
        landingPageDraft: product.landingPageDraft,
        landingPagePublished: product.landingPagePublished,
        lastUpdated: product.updatedAt
      }
    })

  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update landing page data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate that product exists and is a landing page type
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, designType: true }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Auto-enable landing page features if data is being saved
    const updateData: any = {
      landingPageData: body.landingPageData,
      landingPageDraft: body.landingPageData,
      useCustomLandingPage: true,
      designType: 'LANDING_PAGE'
    }

    // If sections are provided, save them
    if (body.landingPageSections) {
      updateData.landingPageSections = body.landingPageSections
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        landingPageData: true,
        landingPagePublished: true,
        updatedAt: true
      }
    })

    // Revalidate relevant pages for performance
    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath(`/product/${updatedProduct.slug}`)
    revalidatePath('/admin/products')

    return NextResponse.json({
      success: true,
      message: 'Landing page saved successfully',
      data: updatedProduct
    })

  } catch (error) {
    console.error('Error saving landing page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save landing page' },
      { status: 500 }
    )
  }
}

// POST - Publish landing page
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields for publishing
    const { landingPageData } = body
    if (!landingPageData?.heroTitle || !landingPageData?.heroSubtitle || !landingPageData?.callToAction) {
      return NextResponse.json(
        { success: false, error: 'Hero title, subtitle, and call to action are required for publishing' },
        { status: 400 }
      )
    }

    // Update and publish
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        landingPageData: landingPageData,
        landingPageSections: body.landingPageSections || [],
        landingPageDraft: landingPageData,
        landingPagePublished: true,
        useCustomLandingPage: true,
        designType: 'LANDING_PAGE',
        // Automatically mark as featured when published
        isFeatured: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        landingPagePublished: true,
        updatedAt: true
      }
    })

    // Comprehensive cache revalidation
    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath(`/product/${updatedProduct.slug}`)
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}`)

    return NextResponse.json({
      success: true,
      message: 'Landing page published successfully',
      data: updatedProduct
    })

  } catch (error) {
    console.error('Error publishing landing page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to publish landing page' },
      { status: 500 }
    )
  }
}

// PATCH - Toggle landing page status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { action } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'unpublish':
        updateData = {
          landingPagePublished: false,
          useCustomLandingPage: false
        }
        break
      
      case 'enable':
        updateData = {
          useCustomLandingPage: true,
          designType: 'LANDING_PAGE'
        }
        break
        
      case 'disable':
        updateData = {
          useCustomLandingPage: false,
          designType: 'REGULAR'
        }
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        slug: true,
        useCustomLandingPage: true,
        landingPagePublished: true,
        designType: true
      }
    })

    // Revalidate pages
    revalidatePath('/')
    revalidatePath(`/product/${updatedProduct.slug}`)
    revalidatePath('/admin/products')

    return NextResponse.json({
      success: true,
      message: 'Landing page status updated successfully',
      data: updatedProduct
    })

  } catch (error) {
    console.error('Error updating landing page status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update landing page status' },
      { status: 500 }
    )
  }
}