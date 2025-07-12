async function testCredentialsSignIn() {
  try {
    console.log('🔍 Testing Credentials Sign-In Process...\n');
    
    // Step 1: Get CSRF token
    console.log('1. Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;
    console.log(`   CSRF Token: ${csrfToken ? '✅ Obtained' : '❌ Missing'}\n`);
    
    if (!csrfToken) {
      throw new Error('Failed to get CSRF token');
    }
    
    // Step 2: Test sign-in with test credentials
    console.log('2. Testing sign-in with test@example.com...');
    const signInData = new URLSearchParams({
      email: 'test@example.com',
      password: 'password123',
      csrfToken: csrfToken,
      callbackUrl: 'http://localhost:3000',
      json: 'true'
    });
    
    const signInResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: signInData.toString(),
    });
    
    console.log(`   Sign-in Response Status: ${signInResponse.status}`);
    console.log(`   Response OK: ${signInResponse.ok ? '✅' : '❌'}`);
    
    if (signInResponse.ok) {
      const signInResult = await signInResponse.json();
      console.log(`   Sign-in Result:`, signInResult);
    } else {
      const errorText = await signInResponse.text();
      console.log(`   Error:`, errorText);
    }
    
    console.log('\\n✅ Credentials sign-in test completed!');
    
  } catch (error) {
    console.error('❌ Credentials sign-in test failed:', error.message);
  }
}

testCredentialsSignIn();
