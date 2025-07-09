import { MongoClient } from 'mongodb'

async function inspectProducts() {
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
    
    // Get a single product to inspect its structure
    const productsCollection = db.collection('Product')
    const sampleProduct = await productsCollection.findOne()
    
    console.log('Sample product structure:')
    console.log(JSON.stringify(sampleProduct, null, 2))

    await client.close()
    
  } catch (error) {
    console.error('Error inspecting products:', error)
    throw error
  }
}

// Run the inspection
inspectProducts().catch(console.error)
