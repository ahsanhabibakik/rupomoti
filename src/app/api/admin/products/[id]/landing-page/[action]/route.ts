import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string, action: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, action } = await params
    const body = await request.json()

    if (action === 'draft') {
      // Save as draft
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          useCustomLandingPage: true,
          landingPageSections: body.sections,
          landingPageDraft: body,
          landingPagePublished: false
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Draft saved successfully',
        product: updatedProduct 
      })
    }

    if (action === 'publish') {
      // Publish the landing page
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          useCustomLandingPage: true,
          landingPageSections: body.sections,
          landingPageDraft: body,
          landingPagePublished: true,
          designType: 'LANDING_PAGE'
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Landing page published successfully',
        product: updatedProduct 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Landing page API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, action: string } }
) {
  try {
    const { id, action } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        useCustomLandingPage: true,
        landingPageSections: true,
        landingPageDraft: true,
        landingPagePublished: true,
        designType: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (action === 'draft') {
      return NextResponse.json({
        success: true,
        data: product.landingPageDraft,
        published: product.landingPagePublished
      })
    }

    if (action === 'sections') {
      return NextResponse.json({
        success: true,
        sections: product.landingPageSections,
        published: product.landingPagePublished
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Landing page API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, action: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Reset to regular product page
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        useCustomLandingPage: false,
        landingPageSections: null,
        landingPageDraft: null,
        landingPagePublished: false,
        designType: 'REGULAR'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Landing page removed successfully',
      product: updatedProduct 
    })
  } catch (error) {
    console.error('Landing page API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
