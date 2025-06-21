#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Rupomoti Authentication System...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file with the following variables:');
  console.log(`
DATABASE_URL="your_mongodb_connection_string"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
  `);
  process.exit(1);
}

console.log('✅ .env file found');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Step 2: Push schema to database
  console.log('🗄️  Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Schema pushed to database\n');

  // Step 3: Seed admin user
  console.log('🌱 Seeding admin user...');
  execSync('npx tsx scripts/seed-admin.ts', { stdio: 'inherit' });
  console.log('✅ Admin user seeded\n');

  console.log('🎉 Authentication system setup complete!');
  console.log(`
📋 Next steps:
1. Start the development server: npm run dev
2. Visit http://localhost:3000/signin
3. Use these demo credentials:
   📧 Email: admin@rupomoti.com
   🔑 Password: admin123

🔧 Features available:
✅ Email/Password authentication
✅ Google OAuth authentication  
✅ Role-based access (USER, MANAGER, ADMIN)
✅ Admin dashboard at /admin
✅ User management for admins
✅ Protected routes with middleware
✅ Session management with NextAuth.js

🚨 Security Notes:
- Change the default admin password in production
- Update NEXTAUTH_SECRET in production
- Configure Google OAuth credentials
  `);

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log(`
🔧 Manual setup steps:
1. npx prisma generate
2. npx prisma db push  
3. npx tsx scripts/seed-admin.ts
4. npm run dev
  `);
  process.exit(1);
}