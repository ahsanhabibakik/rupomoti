import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAdminUser() {
  try {
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@rupomoti.com' },
    })

    console.log('Admin user found:', {
      id: adminUser?.id,
      name: adminUser?.name,
      email: adminUser?.email,
      role: adminUser?.role,
      isAdmin: adminUser?.isAdmin,
      hasPassword: !!adminUser?.password,
    })

    if (!adminUser) {
      console.log('Admin user not found!')
      return
    }

    if (adminUser.role !== 'ADMIN') {
      console.log('User role is not ADMIN:', adminUser.role)
    }

    // Test password verification
    if (adminUser.password) {
      const bcrypt = require('bcryptjs')
      const passwordMatch = await bcrypt.compare('admin123', adminUser.password)
      console.log('Password match:', passwordMatch)
    }

  } catch (error) {
    console.error('Error testing admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminUser()
