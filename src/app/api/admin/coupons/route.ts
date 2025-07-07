import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Query schema for filtering
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  status: z.enum(['active', 'inactive', 'expired', 'all']).default('all'),
  sortBy: z.enum(['createdAt', 'code', 'discountValue', 'expiresAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// GET /api/admin/coupons - Get all coupons with filtering and pagination
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {};

    // Apply search filter
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Apply type filter
    if (query.type) {
      where.type = query.type;
    }

    // Apply status filter
    if (query.status !== 'all') {
      const now = new Date();
      if (query.status === 'active') {
        where.isActive = true;
        where.expiresAt = { gt: now };
      } else if (query.status === 'inactive') {
        where.isActive = false;
      } else if (query.status === 'expired') {
        where.expiresAt = { lt: now };
      }
    }

    const skip = (query.page - 1) * query.limit;

    const [coupons, totalCount] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip,
        take: query.limit,
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / query.limit);

    return NextResponse.json({
      coupons,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons - Create a new coupon
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      code,
      type,
      discountValue,
      description,
      minimumOrderValue,
      maxUses,
      expiresAt,
      isActive = true,
    } = body;

    // Validation
    if (!code || !type || !discountValue) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { message: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        discountValue: parseFloat(discountValue),
        description,
        minimumOrderValue: minimumOrderValue ? parseFloat(minimumOrderValue) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { message: "Failed to create coupon" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/coupons - Update a coupon
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { couponId, ...updateData } = body;

    if (!couponId) {
      return NextResponse.json(
        { message: "Coupon ID is required" },
        { status: 400 }
      );
    }

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...updateData,
        discountValue: updateData.discountValue ? parseFloat(updateData.discountValue) : undefined,
        minimumOrderValue: updateData.minimumOrderValue ? parseFloat(updateData.minimumOrderValue) : undefined,
        maxUses: updateData.maxUses ? parseInt(updateData.maxUses) : undefined,
        expiresAt: updateData.expiresAt ? new Date(updateData.expiresAt) : undefined,
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { message: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coupons - Delete a coupon
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const couponId = searchParams.get('couponId');

    if (!couponId) {
      return NextResponse.json(
        { message: "Coupon ID is required" },
        { status: 400 }
      );
    }

    // Check if coupon exists and is not used in any orders
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    if (coupon._count.orders > 0) {
      return NextResponse.json(
        { message: "Cannot delete coupon that has been used in orders" },
        { status: 400 }
      );
    }

    // Delete coupon
    await prisma.coupon.delete({
      where: { id: couponId },
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { message: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
