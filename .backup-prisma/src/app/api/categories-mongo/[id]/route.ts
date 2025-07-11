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
  { params }: { params: { id: string } }
) {
  let client: MongoClient | null = null
  
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }
    
    client = await getMongoClient()
    const db = client.db()
    const collection = db.collection('Category')
    
    const category = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    // Transform _id to id
    const transformedCategory = {
      ...category,
      id: category._id.toString(),
      _id: undefined
    }
    
    return NextResponse.json({
      success: true,
      data: transformedCategory
    })
    
  } catch (error) {
    console.error('Category fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category', message: error instanceof Error ? error.message : 'Internal server error' },
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
  { params }: { params: { id: string } }
) {
  let client: MongoClient | null = null
  
  try {
    const { id } = params
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }
    
    client = await getMongoClient()
    const db = client.db()
    const collection = db.collection('Category')
    
    // Remove id from update data if present
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _bodyId, ...updateData } = body
    
    // Generate slug from name if updating name
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    
    // Add updated timestamp
    updateData.updatedAt = new Date()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { id, ...updateData }
    })
    
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json(
      { error: 'Failed to update category', message: error instanceof Error ? error.message : 'Internal server error' },
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
  { params }: { params: { id: string } }
) {
  let client: MongoClient | null = null
  
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }
    
    client = await getMongoClient()
    const db = client.db()
    const categoryCollection = db.collection('Category')
    
    // Check if category has products before deletion
    const productsCollection = db.collection('Product')
    const productCount = await productsCollection.countDocuments({ categoryId: id })
    
    if (productCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that contains products' },
        { status: 400 }
      )
    }
    
    const result = await categoryCollection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
    
  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category', message: error instanceof Error ? error.message : 'Internal server error' },
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
