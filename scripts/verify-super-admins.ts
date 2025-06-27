import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifySuperAdmins() {
  try {
    console.log('🔍 Verifying Super Admin users...\n')

    // Get all super admins
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (superAdmins.length === 0) {
      console.log('❌ No Super Admin users found in the database.')
      return
    }

    console.log(`✅ Found ${superAdmins.length} Super Admin user(s):\n`)

    superAdmins.forEach((admin: any, index: number) => {
      console.log(`${index + 1}. 👤 ${admin.name}`)
      console.log(`   📧 Email: ${admin.email}`)
      console.log(`   🏷️  Role: ${admin.role}`)
      console.log(`   👑 Admin: ${admin.isAdmin}`)
      console.log(`   📅 Created: ${admin.createdAt.toLocaleDateString()}`)
      console.log(`   🔄 Updated: ${admin.updatedAt.toLocaleDateString()}`)
      console.log('   ' + '─'.repeat(50))
    })

    // Get total user count
    const totalUsers = await prisma.user.count()
    const adminUsers = await prisma.user.count({
      where: { isAdmin: true },
    })

    console.log(`\n📊 User Statistics:`)
    console.log(`   Total Users: ${totalUsers}`)
    console.log(`   Admin Users: ${adminUsers}`)
    console.log(`   Super Admins: ${superAdmins.length}`)

  } catch (error) {
    console.error('❌ Error verifying Super Admin users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the verification
verifySuperAdmins()
  .catch((error) => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })
