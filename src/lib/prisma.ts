import prisma from './prisma-init'

// Re-export the connection check function
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection established')
    
    // Test collections by querying each model
    const collections = [
      { name: 'User', query: async () => await prisma.user.count() },
      { name: 'Product', query: async () => await prisma.product.count() },
      { name: 'Category', query: async () => await prisma.category.count() },
      { name: 'Order', query: async () => await prisma.order.count() },
      { name: 'Customer', query: async () => await prisma.customer.count() },
      { name: 'Media', query: async () => await prisma.media.count() },
      { name: 'Coupon', query: async () => await prisma.coupon.count() },
      { name: 'Settings', query: async () => await prisma.settings.count() },
    ]

    const results = await Promise.allSettled(
      collections.map(async (collection) => {
        try {
          const count = await collection.query()
          console.log(`✅ Collection ${collection.name} is accessible (${count} records)`)
          return { name: collection.name, status: 'success', count }
        } catch (error) {
          console.error(`❌ Failed to access collection ${collection.name}:`, error)
          return { name: collection.name, status: 'error', error }
        }
      })
    )

    const hasErrors = results.some(result => result.status === 'rejected' || 
      (result.status === 'fulfilled' && result.value.status === 'error'))

    return !hasErrors
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Automatically check connection on import
checkDatabaseConnection()
  .then((isConnected) => {
    if (!isConnected) {
      console.error('❌ Initial database connection check failed')
    }
  })
  .catch((error) => {
    console.error('❌ Unexpected error during database connection check:', error)
  })

export default prisma 