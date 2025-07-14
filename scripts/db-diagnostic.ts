import { prisma } from '@/lib/prisma'

async function diagnosticTest() {
  console.log('🔍 MongoDB Atlas Connection Diagnostic')
  console.log('=====================================')
  
  // Test 1: Basic connection
  console.log('\n1. Testing basic connection...')
  try {
    await prisma.$queryRaw`db.runCommand({ ping: 1 })`
    console.log('✅ Basic connection: SUCCESS')
  } catch (error) {
    console.log('❌ Basic connection: FAILED')
    console.log('   Error:', error.message)
  }

  // Test 2: Database info
  console.log('\n2. Testing database info...')
  try {
    const result = await prisma.$queryRaw`db.runCommand({ buildInfo: 1 })`
    console.log('✅ Database info: SUCCESS')
    console.log('   MongoDB version:', result?.version || 'Unknown')
  } catch (error) {
    console.log('❌ Database info: FAILED')
    console.log('   Error:', error.message)
  }

  // Test 3: Simple count
  console.log('\n3. Testing product count...')
  try {
    const count = await prisma.product.count()
    console.log('✅ Product count: SUCCESS')
    console.log('   Products in database:', count)
  } catch (error) {
    console.log('❌ Product count: FAILED')
    console.log('   Error:', error.message)
  }

  // Test 4: Quick read test
  console.log('\n4. Testing data read...')
  try {
    const products = await prisma.product.findMany({ take: 1 })
    console.log('✅ Data read: SUCCESS')
    console.log('   Sample product:', products[0]?.name || 'No products found')
  } catch (error) {
    console.log('❌ Data read: FAILED')
    console.log('   Error:', error.message)
  }

  // Test 5: Connection pool info
  console.log('\n5. Connection diagnostics...')
  console.log('   Database URL:', process.env.DATABASE_URL?.replace(/\/\/[^:]*:[^@]*@/, '//***:***@'))
  console.log('   Node version:', process.version)
  console.log('   Platform:', process.platform)

  await prisma.$disconnect()
  console.log('\n🏁 Diagnostic complete')
}

// Auto-retry with exponential backoff
async function retryConnection(maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n🔄 Connection attempt ${attempt}/${maxAttempts}`)
    
    try {
      await diagnosticTest()
      console.log('🎉 Connection successful!')
      return true
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message)
      
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // Max 10s delay
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.log('💥 All connection attempts failed')
  return false
}

// Run the diagnostic
if (require.main === module) {
  retryConnection().then(success => {
    process.exit(success ? 0 : 1)
  })
}

export { diagnosticTest, retryConnection }
