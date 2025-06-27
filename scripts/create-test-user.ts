import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash('testuser123', 12)
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        role: 'USER'
      }
    })

    console.log('Created test user:', user.email)

    // Create some addresses for the user
    const addresses = await Promise.all([
      prisma.address.create({
        data: {
          userId: user.id,
          name: 'Test User',
          phone: '+8801712345678',
          street: '123 Main Street, Dhanmondi',
          city: 'Dhaka',
          state: 'Dhaka',
          postalCode: '1205',
          country: 'Bangladesh',
          isDefault: true
        }
      }),
      prisma.address.create({
        data: {
          userId: user.id,
          name: 'Test User',
          phone: '+8801712345678',
          street: '456 Park Road, Gulshan',
          city: 'Dhaka',
          state: 'Dhaka',
          postalCode: '1212',
          country: 'Bangladesh',
          isDefault: false
        }
      })
    ])

    console.log('Created addresses:', addresses.length)

    // Create a sample customer (for orders)
    const customer = await prisma.customer.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '+8801712345678',
        address: '123 Main Street, Dhanmondi, Dhaka',
        city: 'Dhaka',
        zone: 'INSIDE_DHAKA',
        userId: user.id
      }
    })

    // Get a product to create orders
    const product = await prisma.product.findFirst()
    
    if (product) {
      // Create a sample order
      const order = await prisma.order.create({
        data: {
          orderNumber: 'TEST-' + Date.now(),
          customerId: customer.id,
          userId: user.id,
          status: 'DELIVERED',
          paymentStatus: 'PAID',
          paymentMethod: 'CASH_ON_DELIVERY',
          subtotal: product.price,
          deliveryFee: 60,
          total: product.price + 60,
          deliveryZone: 'INSIDE_DHAKA',
          deliveryAddress: '123 Main Street, Dhanmondi, Dhaka',
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              price: product.price
            }
          }
        }
      })

      console.log('Created test order:', order.orderNumber)

      // Add product to wishlist
      await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId: product.id
        }
      })

      console.log('Added product to wishlist')

      // Create a review for the delivered product
      await prisma.review.create({
        data: {
          rating: 5,
          comment: 'Great product! Really satisfied with the quality.',
          productId: product.id,
          userId: user.id
        }
      })

      console.log('Created product review')
    }

    console.log('✅ Test user and data created successfully!')
    console.log('Login credentials:')
    console.log('Email: testuser@example.com')
    console.log('Password: testuser123')

  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
