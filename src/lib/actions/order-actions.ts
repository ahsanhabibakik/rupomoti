import "server-only";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

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