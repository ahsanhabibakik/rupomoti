import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    try {
        const password = await hash('admin123', 10)
        
        const admin = await prisma.user.upsert({
            where: {
                email: 'admin@rupomoti.com',
            },
            update: {},
            create: {
                name: 'Admin',
                email: 'admin@rupomoti.com',
                role: 'ADMIN',
                password: password,
            },
        })

        console.log('Admin user created:', admin)
    } catch (error) {
        console.error('Error seeding admin:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main() 