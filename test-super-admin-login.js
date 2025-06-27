const fetch = require('node-fetch');

async function testSuperAdminLogin() {
  try {
    console.log('🔐 Testing Super Admin login...');
    
    // Test login with super admin credentials
    const loginResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@delwer.com',
        password: 'admin123',
        callbackUrl: '/admin',
        csrfToken: 'test', // In a real scenario, you'd get this from the CSRF endpoint
      }),
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed');
      const errorText = await loginResponse.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSuperAdminLogin();
