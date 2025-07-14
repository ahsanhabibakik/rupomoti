import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { getProductModel } from '@/models/Product';
import { getCategoryModel } from '@/models/Category';
const Product = getProductModel();
const Category = getCategoryModel();

export async function GET() {
  try {
    // Test database connection
    await dbConnect()
    
    // Test basic queries
    const [productCount, categoryCount] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments()
    ])

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        productCount,
        categoryCount,
        timestamp: new Date().toISOString(),
        method: 'Mongoose ODM'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
