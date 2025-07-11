import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';

import { startOfDay, endOfDay, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

export const GET = withMongoose(async (req) => {
  try {
    const session = await auth();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 3m, 12m
    const type = searchParams.get('type') || 'overview'; // overview, sales, products, customers

    let startDate: Date;
    let endDate: Date = new Date();

    // Calculate date range based on period
    switch (period) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '3m':
        startDate = subMonths(endDate, 3);
        break;
      case '12m':
        startDate = subMonths(endDate, 12);
        break;
      case 'thisMonth':
        startDate = startOfMonth(endDate);
        endDate = endOfMonth(endDate);
        break;
      default:
        startDate = subDays(endDate, 7);
    }

    const dateFilter = {
      gte: startOfDay(startDate),
      lte: endOfDay(endDate),
    };

    if (type === 'overview') {
      // Get overview statistics
      const [
        totalOrders,
        totalRevenue,
        totalProducts,
        totalCustomers,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        lowStockProducts,
      ] = await Promise.all([
        prisma.order.count({
          where: { createdAt: dateFilter }
        }),
        prisma.order.aggregate({
          where: { 
            createdAt: dateFilter,
            status: { in: ['DELIVERED', 'SHIPPED'] }
          },
          _sum: { total: true }
        }),
        prisma.product.count({
          where: { status: 'ACTIVE' }
        }),
        prisma.user.count({
          where: { 
            role: 'USER',
            createdAt: dateFilter
          }
        }),
        prisma.order.count({
          where: { 
            createdAt: dateFilter,
            status: 'DELIVERED'
          }
        }),
        prisma.order.count({
          where: { 
            createdAt: dateFilter,
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }),
        prisma.order.count({
          where: { 
            createdAt: dateFilter,
            status: 'CANCELED'
          }
        }),
        prisma.product.count({
          where: {
            status: 'ACTIVE',
            stock: { lte: 10 }
          }
        })
      ]);

      // Get daily sales data for the period
      const dailySales = await prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: dateFilter,
          status: { in: ['DELIVERED', 'SHIPPED'] }
        },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { createdAt: 'asc' }
      });

      return NextResponse.json({
        overview: {
          totalOrders,
          totalRevenue: totalRevenue._sum.total || 0,
          totalProducts,
          totalCustomers,
          completedOrders,
          pendingOrders,
          cancelledOrders,
          lowStockProducts,
          averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0,
        },
        dailySales: dailySales.map(day => ({
          date: day.createdAt.toISOString().split('T')[0],
          sales: day._sum.total || 0,
          orders: day._count.id
        }))
      });
    }

    if (type === 'sales') {
      // Sales report
      const [
        salesByCategory,
        topProducts,
        salesByPaymentMethod,
        monthlyTrends
      ] = await Promise.all([
        // Sales by category
        prisma.orderItem.groupBy({
          by: ['productId'],
          where: {
            order: {
              createdAt: dateFilter,
              status: { in: ['DELIVERED', 'SHIPPED'] }
            }
          },
          _sum: { 
            quantity: true,
            price: true
          }
        }).then(async (items) => {
          const productIds = items.map(item => item.productId);
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { category: true }
          });
          
          const categoryMap = new Map();
          items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product?.category) {
              const categoryName = product.category.name;
              const existing = categoryMap.get(categoryName) || { sales: 0, quantity: 0 };
              categoryMap.set(categoryName, {
                sales: existing.sales + (item._sum.price || 0),
                quantity: existing.quantity + (item._sum.quantity || 0)
              });
            }
          });
          
          return Array.from(categoryMap.entries()).map(([category, data]) => ({
            category,
            sales: data.sales,
            quantity: data.quantity
          }));
        }),

        // Top products
        prisma.orderItem.groupBy({
          by: ['productId'],
          where: {
            order: {
              createdAt: dateFilter,
              status: { in: ['DELIVERED', 'SHIPPED'] }
            }
          },
          _sum: { 
            quantity: true,
            price: true
          },
          _count: { id: true },
          orderBy: { _sum: { price: 'desc' } },
          take: 10
        }).then(async (items) => {
          const productIds = items.map(item => item.productId);
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, images: true }
          });
          
          return items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              name: product?.name || 'Unknown Product',
              image: product?.images?.[0] || null,
              sales: item._sum.price || 0,
              quantity: item._sum.quantity || 0,
              orders: item._count.id
            };
          });
        }),

        // Sales by payment method
        prisma.order.groupBy({
          by: ['paymentMethod'],
          where: {
            createdAt: dateFilter,
            status: { in: ['DELIVERED', 'SHIPPED'] }
          },
          _sum: { total: true },
          _count: { id: true }
        }),

        // Monthly trends (for longer periods)
        period === '12m' ? prisma.order.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: dateFilter,
            status: { in: ['DELIVERED', 'SHIPPED'] }
          },
          _sum: { total: true },
          _count: { id: true }
        }).then(data => {
          // Group by month
          const monthlyData = new Map();
          data.forEach(item => {
            const month = item.createdAt.toISOString().slice(0, 7); // YYYY-MM
            const existing = monthlyData.get(month) || { sales: 0, orders: 0 };
            monthlyData.set(month, {
              sales: existing.sales + (item._sum.total || 0),
              orders: existing.orders + item._count.id
            });
          });
          
          return Array.from(monthlyData.entries()).map(([month, data]) => ({
            month,
            sales: data.sales,
            orders: data.orders
          }));
        }) : []
      ]);

      return NextResponse.json({
        salesByCategory,
        topProducts,
        salesByPaymentMethod: salesByPaymentMethod.map(item => ({
          method: item.paymentMethod,
          sales: item._sum.total || 0,
          orders: item._count.id
        })),
        monthlyTrends
      });
    }

    if (type === 'products') {
      // Product performance report
      const [
        productPerformance,
        stockReport,
        categoryPerformance
      ] = await Promise.all([
        // Product performance
        prisma.product.findMany({
          where: { status: 'ACTIVE' },
          include: {
            orderItems: {
              where: {
                order: {
                  createdAt: dateFilter,
                  status: { in: ['DELIVERED', 'SHIPPED'] }
                }
              }
            },
            category: { select: { name: true } },
            _count: {
              select: {
                orderItems: {
                  where: {
                    order: {
                      createdAt: dateFilter,
                      status: { in: ['DELIVERED', 'SHIPPED'] }
                    }
                  }
                }
              }
            }
          },
          orderBy: { orderItems: { _count: 'desc' } },
          take: 20
        }).then(products => 
          products.map(product => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category?.name,
            stock: product.stock,
            price: product.price,
            salePrice: product.salePrice,
            totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
            revenue: product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            ordersCount: product._count.orderItems
          }))
        ),

        // Stock report
        prisma.product.findMany({
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            price: true
          },
          orderBy: { stock: 'asc' },
          take: 50
        }),

        // Category performance
        prisma.category.findMany({
          where: { isActive: true },
          include: {
            products: {
              include: {
                orderItems: {
                  where: {
                    order: {
                      createdAt: dateFilter,
                      status: { in: ['DELIVERED', 'SHIPPED'] }
                    }
                  }
                }
              }
            }
          }
        }).then(categories =>
          categories.map(category => ({
            id: category.id,
            name: category.name,
            productCount: category.products.length,
            totalRevenue: category.products.reduce((sum, product) => 
              sum + product.orderItems.reduce((itemSum, item) => 
                itemSum + (item.price * item.quantity), 0), 0),
            totalSold: category.products.reduce((sum, product) => 
              sum + product.orderItems.reduce((itemSum, item) => 
                itemSum + item.quantity, 0), 0)
          })).sort((a, b) => b.totalRevenue - a.totalRevenue)
        )
      ]);

      return NextResponse.json({
        productPerformance,
        stockReport: stockReport.map(product => ({
          ...product,
          stockStatus: product.stock <= 5 ? 'critical' : product.stock <= 10 ? 'low' : 'normal'
        })),
        categoryPerformance
      });
    }

    if (type === 'customers') {
      // Customer analytics
      const [
        topCustomers,
        customerGrowth,
        customerStats
      ] = await Promise.all([
        // Top customers by total spent
        prisma.user.findMany({
          where: { role: 'USER' },
          include: {
            orders: {
              where: {
                createdAt: dateFilter,
                status: { in: ['DELIVERED', 'SHIPPED'] }
              }
            }
          }
        }).then(users => 
          users
            .map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
              orderCount: user.orders.length,
              averageOrderValue: user.orders.length > 0 ? 
                user.orders.reduce((sum, order) => sum + order.total, 0) / user.orders.length : 0
            }))
            .filter(customer => customer.totalSpent > 0)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 20)
        ),

        // Customer growth
        prisma.user.groupBy({
          by: ['createdAt'],
          where: {
            role: 'USER',
            createdAt: dateFilter
          },
          _count: { id: true },
          orderBy: { createdAt: 'asc' }
        }).then(data => 
          data.map(item => ({
            date: item.createdAt.toISOString().split('T')[0],
            newCustomers: item._count.id
          }))
        ),

        // Customer statistics
        Promise.all([
          prisma.user.count({
            where: { 
              role: 'USER',
              createdAt: dateFilter
            }
          }),
          prisma.user.count({
            where: {
              role: 'USER',
              orders: {
                some: {
                  createdAt: dateFilter,
                  status: { in: ['DELIVERED', 'SHIPPED'] }
                }
              }
            }
          }),
          prisma.user.count({
            where: {
              role: 'USER',
              orders: {
                some: {
                  createdAt: {
                    gte: subDays(new Date(), 30)
                  }
                }
              }
            }
          })
        ]).then(([newCustomers, activeCustomers, returningCustomers]) => ({
          newCustomers,
          activeCustomers,
          returningCustomers
        }))
      ]);

      return NextResponse.json({
        topCustomers,
        customerGrowth,
        customerStats
      });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });

  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
