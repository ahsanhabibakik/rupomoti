import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmins() {
  try {
    console.log('🚀 Creating Super Admin users...')

    // Super Admin users to create
    const superAdmins = [
      {
        email: 'admin@delwer.com',
        name: 'Delwer Admin',
        password: 'SuperAdmin123!',
      },
      {
        email: 'cc', 
        name: 'Akik Admin',
        password: 'SuperAdmin123!',
      },
    ]

    for (const admin of superAdmins) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: admin.email },
      })

      if (existingUser) {
        console.log(`✅ Super Admin ${admin.email} already exists, updating role...`)
        
        // Update existing user to Super Admin
        await prisma.user.update({
          where: { email: admin.email },
          data: {
            role: 'SUPER_ADMIN',
            isAdmin: true,
            name: admin.name,
          },
        })
        
        console.log(`✅ Updated ${admin.email} to Super Admin`)
      } else {
        console.log(`🔑 Creating new Super Admin: ${admin.email}`)
        
        // Hash the password
        const hashedPassword = await bcryptjs.hash(admin.password, 12)

        // Create new super admin user
        const user = await prisma.user.create({
          data: {
            email: admin.email,
            name: admin.name,
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isAdmin: true,
            emailVerified: new Date(), // Mark as verified
          },
        })

        console.log(`✅ Created Super Admin: ${user.email} (ID: ${user.id})`)
      }
    }

    console.log('🎉 Super Admin setup completed!')
    
    // Display all super admins
    const allSuperAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    console.log('\n📋 Current Super Admins:')
    allSuperAdmins.forEach((admin: any, index: number) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`)
      console.log(`   Role: ${admin.role} | Admin: ${admin.isAdmin} | Created: ${admin.createdAt.toLocaleDateString()}`)
    })

  } catch (error) {
    console.error('❌ Error creating Super Admin users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createSuperAdmins()
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
