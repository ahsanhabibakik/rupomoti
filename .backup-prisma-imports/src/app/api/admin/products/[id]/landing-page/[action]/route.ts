import { NextRequest, NextResponse } from 'next/server'

import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';

import { auth } from '@/app/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, action: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, action } = await params
    const body = await request.json()

    if (action === 'draft') {
      // Save as draft - Enhanced with new structure
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          useCustomLandingPage: true,
          landingPageSections: body.sections || [],
          landingPageDraft: {
            ...body,
            updatedAt: new Date().toISOString()
          },
          landingPagePublished: false,
          // Store global settings
          landingPageGlobalSettings: body.globalSettings || {},
          landingPageSeo: body.seo || {}
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Draft saved successfully',
        product: updatedProduct 
      })
    }

    if (action === 'publish') {
      // Publish the landing page with enhanced structure
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          useCustomLandingPage: true,
          landingPageSections: body.sections || [],
          landingPageDraft: {
            ...body,
            published: true,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          landingPagePublished: true,
          designType: 'LANDING_PAGE',
          // Store global settings
          landingPageGlobalSettings: body.globalSettings || {},
          landingPageSeo: body.seo || {},
          // Update product metadata based on landing page SEO
          metaTitle: body.seo?.title || body.title,
          metaDescription: body.seo?.description || body.description,
          metaKeywords: body.seo?.keywords?.join(', ') || ''
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Landing page published successfully',
        product: updatedProduct 
      })
    }

    // New action: Update specific section
    if (action === 'update-section') {
      const { sectionId, sectionData } = body
      
      // Get current sections
      const product = await prisma.product.findUnique({
        where: { id },
        select: { landingPageSections: true, landingPageDraft: true }
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      // Update specific section
      const currentSections = (product.landingPageSections as any[]) || []
      const updatedSections = currentSections.map((section: Record<string, unknown>) => 
        section.id === sectionId ? { ...section, data: sectionData } : section
      )

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          landingPageSections: updatedSections,
          landingPageDraft: {
            ...(product.landingPageDraft as any),
            sections: updatedSections,
            updatedAt: new Date().toISOString()
          }
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Section updated successfully',
        sections: updatedSections
      })
    }

    // New action: Reorder sections
    if (action === 'reorder-sections') {
      const { sections } = body
      
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          landingPageSections: sections,
          landingPageDraft: {
            ...(await prisma.product.findUnique({ where: { id }, select: { landingPageDraft: true } }))?.landingPageDraft as any,
            sections: sections,
            updatedAt: new Date().toISOString()
          }
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Sections reordered successfully',
        sections: sections
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
  { params }: { params: Promise<{ id: string, action: string }> }
) {
  try {
    const { id, action } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        useCustomLandingPage: true,
        landingPageSections: true,
        landingPageDraft: true,
        landingPagePublished: true,
        landingPageGlobalSettings: true,
        landingPageSeo: true,
        designType: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (action === 'draft') {
      const draftData = product.landingPageDraft as any
      return NextResponse.json({
        success: true,
        data: {
          id: product.id,
          productId: product.id,
          sections: product.landingPageSections || [],
          globalSettings: product.landingPageGlobalSettings || {},
          seo: product.landingPageSeo || {},
          published: product.landingPagePublished,
          publishedAt: draftData?.publishedAt,
          createdAt: draftData?.createdAt || new Date().toISOString(),
          updatedAt: draftData?.updatedAt || new Date().toISOString()
        },
        published: product.landingPagePublished
      })
    }

    if (action === 'sections') {
      return NextResponse.json({
        success: true,
        sections: product.landingPageSections || [],
        published: product.landingPagePublished,
        globalSettings: product.landingPageGlobalSettings || {},
        seo: product.landingPageSeo || {}
      })
    }

    if (action === 'preview') {
      // Return all data needed for preview
      return NextResponse.json({
        success: true,
        data: {
          id: product.id,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          sections: product.landingPageSections || [],
          globalSettings: product.landingPageGlobalSettings || {},
          seo: product.landingPageSeo || {},
          published: product.landingPagePublished
        }
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
  { params }: { params: Promise<{ id: string, action: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, action } = await params

    if (action === 'reset') {
      // Reset to regular product page
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          useCustomLandingPage: false,
          landingPageSections: null,
          landingPageDraft: null,
          landingPagePublished: false,
          landingPageGlobalSettings: null,
          landingPageSeo: null,
          designType: 'REGULAR'
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Landing page removed successfully',
        product: updatedProduct 
      })
    }

    if (action === 'section') {
      // Delete specific section
      const { sectionId } = await request.json()
      
      const product = await prisma.product.findUnique({
        where: { id },
        select: { landingPageSections: true, landingPageDraft: true }
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      const currentSections = (product.landingPageSections as any[]) || []
      const updatedSections = currentSections.filter((section: Record<string, unknown>) => section.id !== sectionId)

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          landingPageSections: updatedSections,
          landingPageDraft: {
            ...(product.landingPageDraft as any),
            sections: updatedSections,
            updatedAt: new Date().toISOString()
          }
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Section deleted successfully',
        sections: updatedSections
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Landing page API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
