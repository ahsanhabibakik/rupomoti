import { MongoClient } from 'mongodb'

async function checkDatabase() {
  // Use the production MongoDB connection string directly
  const connectionString = "mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority"
  
  const client = new MongoClient(connectionString, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  try {
    await client.connect()
    const db = client.db()
    
    console.log('✅ Connected to MongoDB')
    console.log('Database name:', db.databaseName)
    
    // List all collections
    const collections = await db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    
    // Check products collection
    const productsCollection = db.collection('Product')
    const productCount = await productsCollection.countDocuments()
    console.log('Product count:', productCount)
    
    // Get first few products
    const products = await productsCollection.find().limit(3).toArray()
    console.log('Sample products:', products.map(p => ({ name: p.name, id: p._id })))
    
    // Check categories collection
    const categoriesCollection = db.collection('Category')
    const categoryCount = await categoriesCollection.countDocuments()
    console.log('Category count:', categoryCount)
    
    // Get first few categories
    const categories = await categoriesCollection.find().limit(3).toArray()
    console.log('Sample categories:', categories.map(c => ({ name: c.name, id: c._id })))

    await client.close()
    
  } catch (error) {
    console.error('Error checking database:', error)
    throw error
  }
}

// Run the check
checkDatabase().catch(console.error)
