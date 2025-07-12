import { signIn } from 'next-auth/react'

async function testDirectSignIn() {
  try {
    console.log('🔍 Testing Direct Sign-In Process...\n');
    
    // Test the direct signIn function that the form uses
    const result = await signIn('credentials', {
      email: 'test@example.com',
      password: 'password123',
      redirect: false,
    });
    
    console.log('Sign-in result:', result);
    
    if (result?.error) {
      console.log('❌ Sign-in failed:', result.error);
    } else if (result?.ok) {
      console.log('✅ Sign-in successful!');
      console.log('URL:', result.url);
    } else {
      console.log('⚠️ Unexpected result:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error.message);
  }
}

// Note: This would need to be run in a browser environment with NextAuth context
console.log('This script needs to be run in browser console where NextAuth is available');
export { testDirectSignIn };
