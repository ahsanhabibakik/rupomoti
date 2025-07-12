async function testSignIn() {
  try {
    console.log('🔍 Testing Sign-In functionality...\n');
    
    // Test 1: Check if signin page loads
    console.log('1. Testing signin page accessibility...');
    const signinResponse = await fetch('http://localhost:3000/signin');
    console.log(`   Status: ${signinResponse.status} ${signinResponse.ok ? '✅' : '❌'}\n`);
    
    // Test 2: Check auth providers endpoint
    console.log('2. Testing auth providers endpoint...');
    const providersResponse = await fetch('http://localhost:3000/api/auth/providers');
    console.log(`   Status: ${providersResponse.status} ${providersResponse.ok ? '✅' : '❌'}`);
    if (providersResponse.ok) {
      const providers = await providersResponse.json();
      console.log(`   Available providers: ${Object.keys(providers).join(', ')}\n`);
    }
    
    // Test 3: Check CSRF endpoint
    console.log('3. Testing CSRF token endpoint...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    console.log(`   Status: ${csrfResponse.status} ${csrfResponse.ok ? '✅' : '❌'}`);
    if (csrfResponse.ok) {
      const csrf = await csrfResponse.json();
      console.log(`   CSRF Token exists: ${csrf.csrfToken ? '✅' : '❌'}\n`);
    }
    
    // Test 4: Check session endpoint
    console.log('4. Testing session endpoint...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    console.log(`   Status: ${sessionResponse.status} ${sessionResponse.ok ? '✅' : '❌'}`);
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      console.log(`   Current session: ${session.user ? 'Authenticated' : 'Not authenticated'}\n`);
    }
    
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSignIn();
