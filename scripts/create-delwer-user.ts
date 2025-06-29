import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function createDelwerUser() {
  try {
    console.log('🚀 Creating/updating Delwer user...')

    const email = 'delwerhossain006@gmail.com'
    const password = 'olpolpolp123'
    const hashedPassword = await bcryptjs.hash(password, 12)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log(`✅ User ${email} exists, updating password and role...`)
      
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isAdmin: true,
          name: 'Delwer Hossain',
          emailVerified: new Date(),
        },
      })
      
      console.log(`✅ Updated user:`, {
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin
      })
    } else {
      console.log(`🔑 Creating new user: ${email}`)
      
      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          name: 'Delwer Hossain',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isAdmin: true,
          emailVerified: new Date(),
        },
      })

      console.log(`✅ Created user:`, {
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin
      })
    }

    console.log('\n🎯 Login credentials:')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDelwerUser()
