import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Seeding admin user...')
    
    const email = 'admin@rupomoti.com'
    const password = 'admin123' // Change this in production!

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('✅ Admin user already exists:', existingUser.email)
      
      // Update role to ADMIN if not already
      if (existingUser.role !== 'ADMIN') {
        const updated = await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            role: 'ADMIN',
            isAdmin: true 
          }
        })
        console.log('✅ Updated user role to ADMIN:', updated.email)
      }
      return
    }

    // Create admin user
    const hashedPassword = await hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isAdmin: true
      }
    })

    console.log('✅ Admin user created successfully:', user.email)
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('⚠️  Please change the default password in production!')
  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 