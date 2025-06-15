import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: 'admin@rupomoti.com',
      },
    })

    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = await hash('admin123', 12)
      await prisma.user.create({
        data: {
          email: 'admin@rupomoti.com',
          name: 'Admin',
          password: hashedPassword,
          role: 'ADMIN',
        },
      })
      console.log('Admin user created successfully')
    } else {
      console.log('Admin user already exists')
    }
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 