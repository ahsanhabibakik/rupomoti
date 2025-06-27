// Test account features
const testAccountFeatures = async () => {
  const testUser = {
    email: "test@example.com",
    password: "password123"
  }

  try {
    console.log("Testing account features...")
    
    // Test 1: Check if user exists
    const userCheck = await fetch('http://localhost:3001/api/auth/me', {
      headers: {
        'Cookie': 'next-auth.session-token=test'
      }
    })
    console.log("User check status:", userCheck.status)
    
    // Test 2: Check orders API
    const ordersCheck = await fetch('http://localhost:3001/api/orders/user', {
      headers: {
        'Cookie': 'next-auth.session-token=test'
      }
    })
    console.log("Orders API status:", ordersCheck.status)
    
    // Test 3: Check wishlist API
    const wishlistCheck = await fetch('http://localhost:3001/api/wishlist', {
      headers: {
        'Cookie': 'next-auth.session-token=test'
      }
    })
    console.log("Wishlist API status:", wishlistCheck.status)
    
    // Test 4: Check addresses API
    const addressesCheck = await fetch('http://localhost:3001/api/addresses', {
      headers: {
        'Cookie': 'next-auth.session-token=test'
      }
    })
    console.log("Addresses API status:", addressesCheck.status)

    console.log("All tests completed!")
  } catch (error) {
    console.error("Test failed:", error)
  }
}

if (typeof window !== 'undefined') {
  testAccountFeatures()
} else {
  console.log("Run this in browser console")
}
