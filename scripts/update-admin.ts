import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const adminEmail = 'admin@rupomoti.com'
    const adminPassword = 'admin123'

    // Hash the new password
    const hashedPassword = await hash(adminPassword, 12)

    // Update admin user
    const admin = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
      },
    })

    console.log('Admin user updated:', admin)
  } catch (error) {
    console.error('Error updating admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 