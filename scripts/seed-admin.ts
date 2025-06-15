import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@rupomoti.com'
  const password = 'rupomoti2024' // Change this in production!

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('Admin user already exists')
    return
  }

  // Create admin user
  const hashedPassword = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
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