// Test script to verify production fixes
// Run this after making the environment changes

async function testProductionEndpoints() {
  console.log('🧪 Testing Production Endpoints...\n')
  
  const baseUrl = 'https://rupomoti.com' // Your production URL
  
  const endpoints = [
    '/api/products-mongo?limit=3',
    '/api/categories',
    '/api/auth/providers',
    '/api/test-products'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${baseUrl}${endpoint}`)
      const response = await fetch(`${baseUrl}${endpoint}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Success - Status: ${response.status}`)
        
        if (endpoint.includes('products')) {
          console.log(`   Products returned: ${data.products?.length || 0}`)
        } else if (endpoint.includes('categories')) {
          console.log(`   Categories returned: ${data.length || 0}`)
        }
      } else {
        console.log(`❌ Failed - Status: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
    console.log('')
  }
  
  console.log('📝 Next steps:')
  console.log('1. If all tests pass, your site should work')
  console.log('2. If tests fail, check environment variables')
  console.log('3. Clear browser cache and try again')
}

// Run in browser console on your site:
// testProductionEndpoints()

export default testProductionEndpoints
