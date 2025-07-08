/**
 * Database and API Diagnostic Script
 * Run this to check if your production environment is working correctly
 */

import { prisma } from '@/lib/prisma'

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌')
  
  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Test product count
    const productCount = await prisma.product.count()
    console.log(`📦 Products in database: ${productCount}`)

    // Test category count
    const categoryCount = await prisma.category.count()
    console.log(`🏷️ Categories in database: ${categoryCount}`)

    // Test featured products
    const featuredCount = await prisma.product.count({
      where: { isFeatured: true, status: 'ACTIVE' }
    })
    console.log(`⭐ Featured products: ${featuredCount}`)

    // Test recent products
    const recentProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, price: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
    console.log('🆕 Recent products:', recentProducts)

    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔍 Testing Environment Variables...')
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing)
    return false
  } else {
    console.log('✅ All required environment variables are set')
    console.log('🌐 NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    return true
  }
}

export async function runDiagnostics() {
  console.log('🚀 Starting Production Diagnostics...\n')
  
  const envCheck = await testEnvironmentVariables()
  const dbCheck = await testDatabaseConnection()
  
  console.log('\n📊 Diagnostic Results:')
  console.log('Environment Variables:', envCheck ? '✅ PASS' : '❌ FAIL')
  console.log('Database Connection:', dbCheck ? '✅ PASS' : '❌ FAIL')
  
  if (envCheck && dbCheck) {
    console.log('\n🎉 All systems operational!')
  } else {
    console.log('\n⚠️ Issues detected. Please fix the above errors.')
  }
  
  return envCheck && dbCheck
}

// If running directly
if (typeof window === 'undefined' && process.argv[1] === __filename) {
  runDiagnostics().catch(console.error)
}
