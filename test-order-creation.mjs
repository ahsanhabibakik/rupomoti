#!/usr/bin/env node

// Test order creation directly
async function testOrderCreation() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing order creation...\n');
  
  const testOrder = {
    recipientName: "Test Customer",
    recipientPhone: "01712345678",
    recipientEmail: "test@example.com",
    recipientCity: "Dhaka",
    recipientZone: "Dhanmondi",
    recipientArea: "",
    deliveryAddress: "123 Test Street, Dhanmondi, Dhaka",
    orderNote: "Test order created from API test",
    deliveryZone: "INSIDE_DHAKA",
    items: [
      {
        productId: "test-product-id",
        name: "Test Product",
        price: 500,
        quantity: 1,
        image: "/test.jpg"
      }
    ],
    subtotal: 500,
    deliveryFee: 60,
    total: 560,
    paymentMethod: "CASH_ON_DELIVERY",
    userId: null // Guest order
  };
  
  try {
    console.log('Sending order data:', JSON.stringify(testOrder, null, 2));
    
    const response = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Order created successfully!');
      console.log(`Order Number: ${result.order.orderNumber}`);
      console.log(`Order ID: ${result.order.id}`);
    } else {
      console.log('❌ Order creation failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('Make sure the development server is running on localhost:3000');
  }
}

testOrderCreation();
