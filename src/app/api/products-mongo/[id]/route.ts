import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null
  
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    client = await getMongoClient()
    const db = client.db()
    const collection = db.collection('Product')
    
    const product = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Transform _id to id
    const transformedProduct = {
      ...product,
      id: product._id.toString(),
      _id: undefined
    }
    
    return NextResponse.json({
      success: true,
      data: transformedProduct
    })
    
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product', message: error instanceof Error ? error.message : 'Internal server error' },
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null
  
  try {
    const { id } = params
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    client = await getMongoClient()
    const db = client.db()
    const collection = db.collection('Product')
    
    // Remove id from update data if present
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _bodyId, ...updateData } = body
    
    // Add updated timestamp
    updateData.updatedAt = new Date()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { id, ...updateData }
    })
    
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product', message: error instanceof Error ? error.message : 'Internal server error' },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null
  
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    client = await getMongoClient()
    const db = client.db()
    const collection = db.collection('Product')
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
    
  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product', message: error instanceof Error ? error.message : 'Internal server error' },
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
