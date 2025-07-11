#!/bin/bash

# Test Mongoose Migration
# This script runs tests to ensure the migration from Prisma to Mongoose was successful

set -e
echo "🧪 Testing Mongoose Migration"
echo "=============================="

# Check MongoDB connection
echo "🔄 Testing database connection..."
npx tsx <<EOF
import dbConnect from './src/lib/dbConnect';

async function testConnection() {
  try {
    await dbConnect();
    console.log('✅ Successfully connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
EOF

# Test User model
echo "🔄 Testing User model..."
npx tsx <<EOF
import dbConnect from './src/lib/dbConnect';
import User from './src/models/User';

async function testUserModel() {
  try {
    await dbConnect();
    const count = await User.countDocuments();
    console.log(\`✅ User model working - found \${count} users\`);
  } catch (error) {
    console.error('❌ Failed to test User model:', error);
    process.exit(1);
  }
}

testUserModel();
EOF

# Test Product model
echo "🔄 Testing Product model..."
npx tsx <<EOF
import dbConnect from './src/lib/dbConnect';
import Product from './src/models/Product';

async function testProductModel() {
  try {
    await dbConnect();
    const count = await Product.countDocuments();
    console.log(\`✅ Product model working - found \${count} products\`);
    
    // Test a query with population
    const product = await Product.findOne().populate('categoryId');
    if (product) {
      console.log('✅ Product query with population successful');
    } else {
      console.log('⚠️ No products found but query executed');
    }
  } catch (error) {
    console.error('❌ Failed to test Product model:', error);
    process.exit(1);
  }
}

testProductModel();
EOF

# Test Category model
echo "🔄 Testing Category model..."
npx tsx <<EOF
import dbConnect from './src/lib/dbConnect';
import Category from './src/models/Category';

async function testCategoryModel() {
  try {
    await dbConnect();
    const count = await Category.countDocuments();
    console.log(\`✅ Category model working - found \${count} categories\`);
  } catch (error) {
    console.error('❌ Failed to test Category model:', error);
    process.exit(1);
  }
}

testCategoryModel();
EOF

echo ""
echo "✅ All migration tests passed! The migration appears successful."
echo "You can now run 'npm run finalize-migration' to complete the process."
