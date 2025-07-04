const fetch = require('node-fetch');

async function testProductAPI() {
  try {
    // First, let's test if the API is accessible
    const response = await fetch('http://localhost:3001/api/admin/products/68679f75958c3d29959803d7');
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Product data:', JSON.stringify(data, null, 2));
    } else {
      console.log('Error:', response.status, response.statusText);
      const text = await response.text();
      console.log('Response:', text);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProductAPI();
