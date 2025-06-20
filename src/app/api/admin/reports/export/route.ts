import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'csv'
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Fetch orders within date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (type === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Order Number',
        'Customer Name',
        'Customer Phone',
        'Status',
        'Payment Method',
        'Payment Status',
        'Total Amount',
        'Items',
        'Delivery Zone',
        'Order Date'
      ]

      const csvRows = orders.map(order => {
        const items = order.items.map(item => 
          `${item.name} (x${item.quantity})`
        ).join('; ')

        return [
          order.orderNumber,
          order.customer.name,
          order.customer.phone,
          order.status,
          order.paymentMethod,
          order.paymentStatus,
          order.total.toString(),
          items,
          order.deliveryZone,
          order.createdAt.toLocaleDateString()
        ]
      })

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => 
          row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="sales-report-${range}.csv"`
        }
      })
    }

    if (type === 'pdf') {
      // For PDF, we'll create a simple HTML that can be converted to PDF
      // In a real implementation, you'd use a library like Puppeteer or jsPDF
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 20px; margin-bottom: 30px; border-radius: 8px; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-item h3 { margin: 0; color: #333; }
            .summary-item p { margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0066cc; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-pending { color: #f59e0b; }
            .status-confirmed { color: #3b82f6; }
            .status-shipped { color: #8b5cf6; }
            .status-delivered { color: #10b981; }
            .total { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rupomoti Sales Report</h1>
            <p>Date Range: ${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <div class="summary">
            <h2>Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <h3>Total Revenue</h3>
                <p>৳${totalRevenue.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <h3>Total Orders</h3>
                <p>${totalOrders}</p>
              </div>
              <div class="summary-item">
                <h3>Average Order Value</h3>
                <p>৳${averageOrderValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <h2>Order Details</h2>
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.customer.name}<br><small>${order.customer.phone}</small></td>
                  <td class="status-${order.status.toLowerCase()}">${order.status}</td>
                  <td>${order.paymentMethod}<br><small>${order.paymentStatus}</small></td>
                  <td class="total">৳${order.total.toLocaleString()}</td>
                  <td>${order.createdAt.toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>This report was generated automatically by Rupomoti Admin Dashboard</p>
          </div>
        </body>
        </html>
      `

      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="sales-report-${range}.html"`
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid export type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}