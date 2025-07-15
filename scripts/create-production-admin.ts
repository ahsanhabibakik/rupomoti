#!/usr/bin/env tsx

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { getUserModel } from '../src/models/User'

async function createProductionAdminUser() {
  try {
    // Use production MongoDB URI
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority'
    
    console.log('🔌 Connecting to MongoDB Atlas...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB Atlas')

    const User = getUserModel();

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@rupomoti.com' })
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists')
      console.log('📧 Email: admin@rupomoti.com')
      console.log('🔑 You can use the existing password or reset it')
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 12)

      // Create admin user
      const adminUser = new User({
        name: 'Rupomoti Admin',
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
    }

    // Check if super admin user exists
    const existingSuperAdmin = await User.findOne({ email: 'superadmin@rupomoti.com' })
    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('superadmin123', 12)
      
      const superAdminUser = new User({
        name: 'Rupomoti Super Admin',
        email: 'superadmin@rupomoti.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isAdmin: true,
        emailVerified: new Date()
      })

      await superAdminUser.save()
      console.log('✅ Super Admin user created successfully!')
      console.log('📧 Email: superadmin@rupomoti.com')
      console.log('🔑 Password: superadmin123')
    }

    console.log('\n🎉 Production admin setup complete!')
    console.log('🌐 You can now login at: https://rupomoti.com/signin')
    console.log('🛡️ Admin dashboard: https://rupomoti.com/admin')

  } catch (error) {
    console.error('❌ Error creating admin users:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

createProductionAdminUser()
