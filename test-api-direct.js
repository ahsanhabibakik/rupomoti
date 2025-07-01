// Test the API directly without the Next.js server running
// Run this with: node test-api-direct.js

const http = require('http');

function testAPI() {
  console.log('🧪 Testing Orders API at http://localhost:3000...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/orders?status=active&page=1&limit=10',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ API Response:', {
          hasOrders: Array.isArray(jsonData.orders),
          ordersCount: jsonData.orders?.length || 0,
          totalOrders: jsonData.totalOrders,
          totalPages: jsonData.totalPages,
          firstOrder: jsonData.orders?.[0] ? {
            id: jsonData.orders[0].id,
            orderNumber: jsonData.orders[0].orderNumber,
            isFakeOrder: jsonData.orders[0].isFakeOrder,
            status: jsonData.orders[0].status
          } : null
        });
      } catch (error) {
        console.log('❌ Failed to parse JSON response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Network Error:', error.message);
    console.log('💡 Make sure the dev server is running with: npm run dev');
  });

  req.end();
}

testAPI();
