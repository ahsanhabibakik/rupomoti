import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'

export async function GET() {
  try {
    await dbConnect()
    
    // Simple query to get all products
    const products = await Product.find({ status: 'ACTIVE' }).limit(5).lean()
    
    return NextResponse.json({
      success: true,
      data: products.map(p => ({
        id: p._id.toString(),
        name: p.name,
        price: p.price
      })),
      count: products.length
    })
    
  } catch (error) {
    console.error('Simple Products API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
