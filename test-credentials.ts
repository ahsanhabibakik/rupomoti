import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testSuperAdminCredentials() {
  try {
    console.log('🔍 Checking super admin credentials...')
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@delwer.com' }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('👤 User found:')
    console.log('   Email:', user.email)
    console.log('   Name:', user.name)
    console.log('   Role:', user.role)
    console.log('   IsAdmin:', user.isAdmin)
    console.log('   Has Password:', !!user.password)
    
    if (user.password) {
      const isValid = await bcrypt.compare('SuperAdmin123!', user.password)
      console.log('   Password Valid:', isValid)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testSuperAdminCredentials()
