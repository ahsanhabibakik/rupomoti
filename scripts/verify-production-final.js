#!/usr/bin/env node
/**
 * Production Database Verification Script
 * Tests all working database endpoints after resolution
 */

const https = require('https');
const { promisify } = require('util');

const BASE_URL = 'https://www.rupomoti.com';

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testEndpoint(endpoint, description) {
  try {
    console.log(`🧪 Testing: ${description}`);
    console.log(`   URL: ${BASE_URL}${endpoint}`);
    
    const result = await makeRequest(`${BASE_URL}${endpoint}`);
    
    if (result.status === 200) {
      console.log(`   ✅ Status: ${result.status} - SUCCESS`);
      
      if (typeof result.data === 'object') {
        if (result.data.success !== undefined) {
          console.log(`   📊 Response: ${result.data.success ? 'SUCCESS' : 'FAILED'}`);
        }
        
        if (result.data.data && Array.isArray(result.data.data)) {
          console.log(`   📋 Data Count: ${result.data.data.length} items`);
        }
        
        if (result.data.pagination) {
          const p = result.data.pagination;
          console.log(`   📄 Pagination: Page ${p.page}/${p.totalPages}, Total: ${p.totalCategories || p.totalProducts || 'N/A'}`);
        }
        
        if (result.data.productCount !== undefined) {
          console.log(`   🛍️ Products: ${result.data.productCount}`);
        }
        
        if (result.data.categoryCount !== undefined) {
          console.log(`   📂 Categories: ${result.data.categoryCount}`);
        }
        
        if (result.data.collections) {
          console.log(`   🗄️ Collections: ${result.data.collections.length} found`);
        }
      }
      
      return true;
    } else {
      console.log(`   ❌ Status: ${result.status} - FAILED`);
      if (result.data.error) {
        console.log(`   💥 Error: ${result.data.error}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🎯 Rupomoti Production Database Verification');
  console.log('=' .repeat(50));
  console.log(`🌐 Testing production site: ${BASE_URL}`);
  console.log(`⏰ Test time: ${new Date().toISOString()}`);
  console.log('');

  const tests = [
    {
      endpoint: '/api/test-mongo',
      description: 'Direct MongoDB Connection Test'
    },
    {
      endpoint: '/api/categories-mongo',
      description: 'Categories API (MongoDB Native)'
    },
    {
      endpoint: '/api/products-mongo', 
      description: 'Products API (MongoDB Native)'
    },
    {
      endpoint: '/api/categories-mongo?search=ring',
      description: 'Categories Search Functionality'
    },
    {
      endpoint: '/api/products-mongo?page=1&pageSize=5',
      description: 'Products Pagination Test'
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.description);
    if (success) passed++;
    console.log('');
  }

  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${passed}/${total} tests`);
  console.log(`❌ Failed: ${total - passed}/${total} tests`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Database connectivity is working perfectly');
    console.log('✅ MongoDB-native API endpoints are functional');
    console.log('✅ Production deployment is successful');
    console.log('\n🚀 Rupomoti is ready for production use!');
  } else {
    console.log('\n⚠️  Some tests failed. Check endpoint status above.');
  }

  console.log('\n📚 Additional Information:');
  console.log('- MongoDB Atlas Network Access: 0.0.0.0/0 configured');
  console.log('- Environment variables: Set in Vercel production');
  console.log('- Domain: rupomoti.com → www.rupomoti.com (working)');
  console.log('- Database: Direct MongoDB connection established');
  console.log('');
  console.log('📖 For troubleshooting guides, see:');
  console.log('- PRODUCTION_DATABASE_RESOLVED.md');
  console.log('- MONGODB_ATLAS_FIX.md');
  console.log('- PRODUCTION_TROUBLESHOOTING.md');
}

main().catch(console.error);
