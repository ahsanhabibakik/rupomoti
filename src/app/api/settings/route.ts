import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// Mock settings data - in a real app, this would be stored in database
const DEFAULT_SETTINGS = {
  // General
  siteName: 'Rupomoti',
  siteDescription: 'Your trusted online shopping destination',
  contactEmail: 'support@rupomoti.com',
  contactPhone: '+880 1234567890',
  address: 'Dhaka, Bangladesh',
  
  // Payment
  bkashNumber: '01712345678',
  bankDetails: {
    name: 'Dutch Bangla Bank Ltd.',
    account: '135-110-12345',
    accountName: 'Rupomoti Fashion House'
  },
  
  // Shipping
  freeShippingThreshold: 1000,
  shippingCosts: {
    INSIDE_DHAKA: 60,
    PERIPHERAL_DHAKA: 90,
    OUTSIDE_DHAKA: 120
  },
  
  // Social Media
  facebookUrl: 'https://facebook.com/rupomoti',
  instagramUrl: 'https://instagram.com/rupomoti',
  twitterUrl: 'https://twitter.com/rupomoti',
  
  // SEO
  metaTitle: 'Rupomoti - Online Shopping in Bangladesh',
  metaDescription: 'Shop the latest products with best prices and fastest delivery in Bangladesh',
  metaKeywords: 'online shopping, bangladesh, rupomoti, ecommerce',
}

export async function GET() {
  try {
    // In a real implementation, fetch from database
    // For now, return default settings
    return NextResponse.json(DEFAULT_SETTINGS)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const updatedSettings = await request.json()

    // In a real implementation, save to database
    // For now, just return the updated settings
    return NextResponse.json({
      ...DEFAULT_SETTINGS,
      ...updatedSettings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}