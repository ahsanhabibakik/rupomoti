// This script is deprecated. Prisma is no longer used. Use Mongoose scripts instead.
import { hash } from 'bcryptjs'

async function main() {
  try {
    // Create admin user with hashed password
    const hashedPassword = await hash('admin123', 12)
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rupomoti.com' },
      update: {
        role: 'ADMIN',
        isAdmin: true,
      },
      create: {
        email: 'admin@rupomoti.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isAdmin: true,
        emailVerified: new Date(),
      },
    })

    console.log('✅ Admin user created successfully')
    console.log('Email:', admin.email)
    console.log('Password: admin123')
    console.log('You can now login to the admin panel')
  } catch (error) {
    console.error('Error seeding admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 
