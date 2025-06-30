#!/usr/bin/env node

// Test the APIs directly
async function testAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing APIs directly...\n');
  
  try {
    // Test simple endpoint first
    console.log('1. Testing simple endpoint...');
    const simpleResponse = await fetch(`${baseUrl}/api/test-simple`);
    const simpleData = await simpleResponse.json();
    
    console.log('Simple API Response:', {
      status: simpleResponse.status,
      data: simpleData
    });
    
    if (simpleResponse.status !== 200) {
      console.log('❌ Simple API failed, auth might be the issue');
      return;
    }
    
    // Test admin orders endpoint
    console.log('\n2. Testing admin orders endpoint...');
    const ordersResponse = await fetch(`${baseUrl}/api/admin/orders?status=active&page=1&limit=10`);
    const ordersData = await ordersResponse.json();
    
    console.log('Admin Orders API Response:', {
      status: ordersResponse.status,
      hasOrders: ordersData.orders?.length > 0,
      ordersCount: ordersData.orders?.length,
      totalOrders: ordersData.totalOrders,
      error: ordersData.error
    });
    
    // Test audit logs endpoint
    if (ordersData.orders?.length > 0) {
      console.log('\n3. Testing audit logs endpoint...');
      const orderId = ordersData.orders[0].id;
      const auditResponse = await fetch(`${baseUrl}/api/admin/audit-logs?orderId=${orderId}`);
      const auditData = await auditResponse.json();
      
      console.log('Audit Logs API Response:', {
        status: auditResponse.status,
        auditLogsCount: auditData.length,
        error: auditData.error
      });
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure the development server is running on localhost:3000');
  }
}

testAPIs();
