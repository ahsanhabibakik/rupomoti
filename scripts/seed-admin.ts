import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const adminEmail = 'admin@rupomoti.com'
    const adminPassword = 'admin123'

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await hash(adminPassword, 12)
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isAdmin: true,
        emailVerified: new Date(),
      },
    })

    console.log('Admin user created:', admin)
  } catch (error) {
    console.error('Error seeding admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 