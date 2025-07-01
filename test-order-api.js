// Test script to verify orders API is working
const fetch = require('node-fetch');

async function testOrdersAPI() {
  console.log('🧪 Testing Orders API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/orders?status=active&page=1&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // You may need to add auth headers here if needed
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', {
        ordersCount: data.orders?.length,
        totalOrders: data.totalOrders,
        firstOrder: data.orders?.[0] ? {
          id: data.orders[0].id,
          orderNumber: data.orders[0].orderNumber,
          isFakeOrder: data.orders[0].isFakeOrder,
          createdAt: data.orders[0].createdAt
        } : null
      });
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testOrdersAPI();
