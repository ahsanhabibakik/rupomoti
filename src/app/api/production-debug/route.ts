import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'
import Category from '@/models/Category'
import Order from '@/models/Order'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 Production Diagnostic Starting...')
    
    // Test environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
      hasCloudinary: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    }
    
    console.log('Environment check:', envCheck)
    
    // Test database connection
    let dbTest: { connected: boolean; error: string | null; products: number; activeProducts: number; categories: number; orders: number } = { 
      connected: false, 
      error: null, 
      products: 0, 
      activeProducts: 0, 
      categories: 0, 
      orders: 0 
    }
    try {
      await dbConnect()
      
      const productCount = await Product.countDocuments()
      const activeProducts = await Product.countDocuments({ status: 'ACTIVE' })
      const categoryCount = await Category.countDocuments()
      const orderCount = await Order.countDocuments()
      
      dbTest = {
        connected: true,
        error: null,
        products: productCount,
        activeProducts,
        categories: categoryCount,
        orders: orderCount
      }
      
      console.log('Database test passed:', dbTest)
    } catch (dbError) {
      dbTest = {
        connected: false,
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        products: 0,
        activeProducts: 0,
        categories: 0,
        orders: 0
      }
      console.error('Database test failed:', dbError)
    }
    
    // Test a simple product query
    let productTest: { success: boolean; error: string | null; sampleProduct: unknown } = { 
      success: false, 
      error: null, 
      sampleProduct: null 
    }
    try {
      const sampleProduct = await Product.findOne({ status: 'ACTIVE' })
        .select('name price categoryId')
        .lean()
      
      let categoryName = null
      if (sampleProduct?.categoryId) {
        const category = await Category.findById(sampleProduct.categoryId).select('name').lean()
        categoryName = category?.name
      }
      
      productTest = {
        success: true,
        error: null,
        sampleProduct: sampleProduct ? {
          id: sampleProduct._id.toString(),
          name: sampleProduct.name,
          price: sampleProduct.price,
          category: categoryName
        } : null
      }
    } catch (productError) {
      productTest = {
        success: false,
        error: productError instanceof Error ? productError.message : 'Unknown product query error',
        sampleProduct: null
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbTest,
      productQuery: productTest,
      status: 'diagnostic-complete'
    })
    
  } catch (error) {
    console.error('Diagnostic failed:', error)
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Diagnostic failed',
      status: 'diagnostic-failed'
    }, { status: 500 })
  }
}
