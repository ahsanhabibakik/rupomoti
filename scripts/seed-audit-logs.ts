import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAuditLogs() {
  try {
    console.log('🔍 Creating test audit logs...')

    // Get some existing orders
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        userId: true
      }
    })

    console.log(`Found ${orders.length} orders to create audit logs for`)

    // Get a user to act as the logger (preferably an admin)
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { isAdmin: true },
          { role: 'ADMIN' },
          { role: 'MANAGER' }
        ]
      },
      select: { id: true, name: true, email: true }
    })

    if (!adminUser) {
      console.log('❌ No admin user found to create audit logs')
      return
    }

    console.log(`Using admin user: ${adminUser.name} (${adminUser.email})`)

    // Create audit logs for each order
    for (const order of orders) {
      // Create an audit log for order creation
      await prisma.auditLog.create({
        data: {
          model: 'Order',
          recordId: order.id,
          userId: adminUser.id,
          action: 'CREATE',
          details: {
            orderNumber: order.orderNumber,
            initialStatus: order.status
          }
        }
      })

      // Create an audit log for status change (simulate)
      await prisma.auditLog.create({
        data: {
          model: 'Order',
          recordId: order.id,
          userId: adminUser.id,
          action: 'UPDATE_STATUS',
          field: 'status',
          oldValue: 'PENDING',
          newValue: order.status
        }
      })

      console.log(`✅ Created audit logs for order ${order.orderNumber}`)
    }

    console.log('🎉 Audit logs seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding audit logs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAuditLogs()
