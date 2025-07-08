/**
 * Environment Variable Validation Script
 * 
 * This script checks for the presence of required environment variables
 * before the application builds or starts.
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'STEADFAST_API_KEY',
  'STEADFAST_SECRET_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
];

console.log('🔍 Checking environment variables...');

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
const presentOptionalVars = optionalEnvVars.filter(varName => process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  
  if (process.env.NODE_ENV === 'production') {
    console.error('\n❌ Production build cannot proceed without required environment variables.');
    process.exit(1);
  } else {
    console.warn('\n⚠️ Development mode: application may not function correctly without these variables.');
  }
} else {
  console.log('✅ All required environment variables are present.');
}

if (presentOptionalVars.length > 0) {
  console.log(`✅ ${presentOptionalVars.length}/${optionalEnvVars.length} optional environment variables configured.`);
} else {
  console.log('⚠️ No optional environment variables are configured.');
}

// Check DATABASE_URL format
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    console.log(`✅ DATABASE_URL format appears valid (${url.protocol})`);
  } catch (error) {
    console.error('❌ DATABASE_URL appears to be malformed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

console.log('✅ Environment check completed.');
