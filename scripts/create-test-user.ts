import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'USER' },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function createTestUser() {
  try {
    console.log('Connecting to MongoDB...')
    const dbUrl = 'mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority'
    await mongoose.connect(dbUrl)
    console.log('Connected to MongoDB')
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' })
    if (existingUser) {
      console.log('Test user already exists!')
      console.log('Email: test@example.com')
      console.log('Password: password123')
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // Create test user
    const testUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'USER',
      isAdmin: false
    })
    
    await testUser.save()
    console.log('✅ Test user created successfully!')
    console.log('Email: test@example.com')
    console.log('Password: password123')
    console.log('You can now test email/password login')
    
    // Also create an admin user
    const adminExists = await User.findOne({ email: 'admin@example.com' })
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 12)
      const adminUser = new User({
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isAdmin: true
      })
      
      await adminUser.save()
      console.log('✅ Admin user created successfully!')
      console.log('Email: admin@example.com')
      console.log('Password: admin123')
    }
    
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createTestUser()
