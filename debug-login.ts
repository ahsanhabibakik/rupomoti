import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function debugLogin() {
  try {
    console.log('🔐 Testing Super Admin Login Flow...\n')
    
    // Step 1: Check user exists
    const user = await prisma.user.findUnique({
      where: { email: 'admin@delwer.com' }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ Step 1: User found')
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   IsAdmin:', user.isAdmin)
    console.log('')
    
    // Step 2: Check password
    if (!user.password) {
      console.log('❌ No password set')
      return
    }
    
    const isPasswordValid = await bcrypt.compare('SuperAdmin123!', user.password)
    console.log('✅ Step 2: Password validation')
    console.log('   Password Valid:', isPasswordValid)
    console.log('')
    
    // Step 3: Check what would be returned by authorize
    if (isPasswordValid) {
      const authResult = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin,
      }
      console.log('✅ Step 3: Authorize would return:')
      console.log('   ', JSON.stringify(authResult, null, 2))
      console.log('')
    }
    
    // Step 4: Check regular admin for comparison
    const regularAdmin = await prisma.user.findFirst({
      where: { 
        role: 'ADMIN',
        isAdmin: true 
      }
    })
    
    if (regularAdmin) {
      console.log('✅ Step 4: Regular Admin for comparison')
      console.log('   Email:', regularAdmin.email)
      console.log('   Role:', regularAdmin.role)
      console.log('   IsAdmin:', regularAdmin.isAdmin)
      console.log('')
    }
    
    // Step 5: Check middleware logic simulation
    console.log('✅ Step 5: Middleware logic check')
    const userRole = user.role
    const isAdmin = user.isAdmin
    const wouldAllow = isAdmin || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'MANAGER'
    console.log('   Role check:', userRole === 'SUPER_ADMIN')
    console.log('   IsAdmin check:', isAdmin === true)
    console.log('   Combined result:', wouldAllow)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLogin()
