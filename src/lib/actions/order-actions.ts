import dbConnect from '@/lib/dbConnect';
// Define OrderStatus enum to replace Prisma import
enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
// Import Mongoose models to replace Prisma models

// Define Decimal type to replace Prisma.Decimal
type Decimal = number;
// Import Mongoose models to replace Prisma models


export async function getOrders({
  search = "",
  status,
  startDate,
  endDate,
  page = 1,
  limit = 10,
}: {
  search?: string;
  status?: OrderStatus | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const offset = (page - 1) * limit;

  try {
    const where: any = search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { customer: { name: { contains: search, mode: "insensitive" } } },
            { recipientName: { contains: search, mode: "insensitive" } },
            { recipientPhone: { contains: search, mode: "insensitive" } },
            {
              items: {
                some: {
                  product: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            },
          ],
        }
      : {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });

    const totalOrders = await prisma.order.count({ where });
    const totalPages = Math.ceil(totalOrders / limit);

    return { orders, totalOrders, totalPages };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return {
      orders: [],
      totalOrders: 0,
      totalPages: 0,
      error: "Failed to fetch orders. Please check database connection and schema.",
    };
  }
} 