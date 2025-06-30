#!/usr/bin/env node

// Test creating a single order via the API to verify everything works
async function testSingleOrder() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing single order creation via API...\n');
  
  // Get a real product ID first
  try {
    const productsResponse = await fetch(`${baseUrl}/api/products`);
    if (!productsResponse.ok) {
      console.log('❌ Could not fetch products');
      return;
    }
    
    const products = await productsResponse.json();
    if (!products || products.length === 0) {
      console.log('❌ No products available');
      return;
    }
    
    const product = products[0];
    console.log(`📦 Using product: ${product.name} - ৳${product.price}`);
    
    const testOrder = {
      recipientName: "API Test Customer",
      recipientPhone: "01700000001",
      recipientEmail: "test@api.com",
      recipientCity: "Dhaka",
      recipientZone: "Dhanmondi",
      recipientArea: "",
      deliveryAddress: "123 API Test Street, Dhanmondi, Dhaka",
      orderNote: "Test order created via API",
      deliveryZone: "INSIDE_DHAKA",
      items: [
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image || "/placeholder.jpg"
        }
      ],
      subtotal: product.price,
      deliveryFee: 60,
      total: product.price + 60,
      paymentMethod: "CASH_ON_DELIVERY",
      userId: null // Guest order
    };
    
    console.log('📤 Creating order...');
    
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });
    
    const result = await response.json();
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Order created successfully!');
      console.log(`📝 Order Number: ${result.order.orderNumber}`);
      console.log(`💰 Total: ৳${result.order.total}`);
      console.log(`👤 Customer: ${result.order.customer.name}`);
      console.log('\n🎉 Frontend order creation is working!');
    } else {
      console.log('❌ Order creation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n⚠️  Make sure the development server is running on localhost:3000');
  }
}

testSingleOrder();
