import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminEmail = 'rupomoti.official@gmail.com' // Replace with your Google email
  const adminPassword = 'admin123' // This won't be used for Google auth

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingUser) {
    console.log('Admin user already exists')
    return
  }

  // Create admin user
  const hashedPassword = await hash(adminPassword, 10)
  const user = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('Admin user created:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 