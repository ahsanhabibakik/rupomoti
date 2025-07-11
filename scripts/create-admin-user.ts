#!/usr/bin/env tsx

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../src/models/User'

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/rupomoti'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Check if admin user already exists
    const existingAdmin = await User.findByEmail('admin@rupomoti.com')
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@rupomoti.com',
      password: hashedPassword,
      role: 'ADMIN',
      isAdmin: true,
      emailVerified: new Date()
    })

    await adminUser.save()
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@rupomoti.com')
    console.log('🔑 Password: admin123')

    // Also create a super admin user
    const existingSuperAdmin = await User.findByEmail('superadmin@rupomoti.com')
    if (!existingSuperAdmin) {
      const superAdminUser = new User({
        name: 'Super Admin',
        email: 'superadmin@rupomoti.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isAdmin: true,
        emailVerified: new Date()
      })

      await superAdminUser.save()
      console.log('✅ Super Admin user created successfully!')
      console.log('📧 Email: superadmin@rupomoti.com')
      console.log('🔑 Password: admin123')
    }

    // Create a test regular user
    const existingUser = await User.findByEmail('user@test.com')
    if (!existingUser) {
      const testPassword = await bcrypt.hash('password123', 12)
      const testUser = new User({
        name: 'Test User',
        email: 'user@test.com',
        password: testPassword,
        role: 'USER',
        isAdmin: false,
        emailVerified: new Date()
      })

      await testUser.save()
      console.log('✅ Test user created successfully!')
      console.log('📧 Email: user@test.com')
      console.log('🔑 Password: password123')
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

createAdminUser()
