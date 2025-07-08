/**
 * Simple test script to verify production deployment
 * Run this after deployment to ensure everything works
 */

async function testProductionEndpoints() {
  const baseUrl = 'https://rupamuti.com'
  
  console.log('🧪 Testing Production Endpoints...\n')
  
  const endpoints = [
    '/api/health',
    '/api/products?limit=3',
    '/api/categories',
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${baseUrl}${endpoint}`)
      const response = await fetch(`${baseUrl}${endpoint}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Success: ${endpoint}`)
        
        if (endpoint.includes('products')) {
          console.log(`   📦 Found ${data.products?.length || 0} products`)
        } else if (endpoint.includes('categories')) {
          console.log(`   🏷️ Found ${data.categories?.length || 0} categories`)
        } else if (endpoint.includes('health')) {
          console.log(`   💚 Status: ${data.status}`)
          console.log(`   🗄️ Database: ${data.services?.database?.status}`)
        }
      } else {
        console.log(`❌ Failed: ${endpoint} (${response.status})`)
        const text = await response.text()
        console.log(`   Error: ${text.substring(0, 100)}...`)
      }
    } catch (error) {
      console.log(`❌ Network Error: ${endpoint}`)
      console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    console.log('') // Empty line
  }
  
  console.log('🏁 Test Complete!')
  console.log('\n📝 If any tests failed:')
  console.log('1. Check environment variables in your hosting platform')
  console.log('2. Ensure NEXTAUTH_URL=https://rupamuti.com')
  console.log('3. Verify Google OAuth redirect URIs include your domain')
  console.log('4. Check database connection from hosting platform')
}

// Run if called directly
if (typeof window === 'undefined') {
  testProductionEndpoints().catch(console.error)
}

export { testProductionEndpoints }
