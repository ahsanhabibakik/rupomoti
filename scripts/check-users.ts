import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// User schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  isAdmin: Boolean,
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL || '')
    
    console.log('Checking users in database...')
    const users = await User.find({}).select('email name role isAdmin')
    
    console.log(`\nFound ${users.length} users:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`)
      console.log(`   Name: ${user.name || 'Not set'}`)
      console.log(`   Role: ${user.role || 'Not set'}`)
      console.log(`   Admin: ${user.isAdmin || false}`)
      console.log('---')
    })
    
    if (users.length === 0) {
      console.log('No users found! Need to create a test user.')
    }
    
  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

checkUsers()
