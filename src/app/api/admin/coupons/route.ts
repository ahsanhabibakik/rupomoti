import { NextResponse } from "next/server";
import { auth } from '@/app/auth';
import { authOptions } from "@/app/auth";
import dbConnect from '@/lib/mongoose';
import Coupon from '@/models/Coupon';
import AuditLog from '@/models/AuditLog';


import { z } from "zod";

// Query schema for filtering
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]).optional()
  ),
  status: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["active", "inactive", "expired", "all"]).default("all")
  ),
  sortBy: z
    .enum(["createdAt", "code", "value", "validUntil"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// GET /api/admin/coupons - Get all coupons with filtering and pagination
export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { message: "Invalid query parameters", errors: queryResult.error.issues },
        { status: 400 }
      );
    }

    const query = queryResult.data;

    const where: Record<string, unknown> = {};

    // Apply search filter
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Apply type filter
    if (query.type) {
      where.type = query.type;
    }

    // Apply status filter
    if (query.status !== "all") {
      const now = new Date();
      if (query.status === "active") {
        where.isActive = true;
        where.validUntil = { gt: now };
      } else if (query.status === "inactive") {
        where.isActive = false;
      } else if (query.status === "expired") {
        where.validUntil = { lt: now };
      }
    }

    const skip = (query.page - 1) * query.limit;

    // Convert Prisma where conditions to Mongoose
    const mongooseWhere: any = {};
    if (where.isActive !== undefined) {
      mongooseWhere.isActive = where.isActive;
    }
    if (where.type) {
      mongooseWhere.type = where.type;
    }
    if (where.name && where.name.contains) {
      mongooseWhere.name = { $regex: where.name.contains, $options: 'i' };
    }
    if (where.code && where.code.contains) {
      mongooseWhere.code = { $regex: where.code.contains, $options: 'i' };
    }

    // Execute queries in parallel (similar to transaction)
    const [coupons, totalCount] = await Promise.all([
      Coupon.find(mongooseWhere)
        .sort({ [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(query.limit)
        .populate('createdBy', 'id name email')
        .populate('updatedBy', 'id name email'),
      Coupon.countDocuments(mongooseWhere),
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid query parameters", errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons - Create a new coupon
export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      code,
      type,
      value,
      description,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive = true,
      applicableZones,
    } = body;

    // Validation
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });

    if (existingCoupon) {
      return NextResponse.json(
        { message: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = await Coupon.create({
      code,
      type,
      value: parseFloat(value),
      description,
      minimumAmount: minimumAmount ? parseFloat(minimumAmount) : null,
      maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : undefined,
      isActive,
      applicableZones: applicableZones || [],
      createdById: userId,
      updatedById: userId,
    });

    // Populate the created coupon with user details
    await coupon.populate([
      { path: 'createdBy', select: 'id name email' },
      { path: 'updatedBy', select: 'id name email' }
    ]);

    // Create audit log
    await AuditLog.create({
      model: "Coupon",
      recordId: coupon._id.toString(),
      userId,
      action: "CREATE",
      details: {
        coupon,
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
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
export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { couponId, ...updateData } = body;

    if (!couponId) {
      return NextResponse.json(
        { message: "Coupon ID is required" },
        { status: 400 }
      );
    }

    // Check if coupon exists
    const existingCoupon = await Coupon.findById(couponId);

    if (!existingCoupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Process update data
    const processedData: Record<string, unknown> = {};
    
    if (updateData.value !== undefined) {
      processedData.value = parseFloat(updateData.value);
    }
    
    if (updateData.minimumAmount !== undefined) {
      processedData.minimumAmount = updateData.minimumAmount ? parseFloat(updateData.minimumAmount) : null;
    }
    
    if (updateData.maximumDiscount !== undefined) {
      processedData.maximumDiscount = updateData.maximumDiscount ? parseFloat(updateData.maximumDiscount) : null;
    }
    
    if (updateData.usageLimit !== undefined) {
      processedData.usageLimit = updateData.usageLimit ? parseInt(updateData.usageLimit) : null;
    }
    
    if (updateData.validFrom !== undefined) {
      processedData.validFrom = updateData.validFrom ? new Date(updateData.validFrom) : new Date();
    }
    
    if (updateData.validUntil !== undefined) {
      processedData.validUntil = updateData.validUntil ? new Date(updateData.validUntil) : undefined;
    }
    
    // Add other fields directly
    if (updateData.type) processedData.type = updateData.type;
    if (updateData.code) processedData.code = updateData.code;
    if (updateData.description !== undefined) processedData.description = updateData.description;
    if (updateData.isActive !== undefined) processedData.isActive = updateData.isActive;
    if (updateData.applicableZones !== undefined) processedData.applicableZones = updateData.applicableZones;

    // Add audit field
    processedData.updatedById = userId;

    // Update coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      processedData,
      { new: true }
    ).populate([
      { path: 'createdBy', select: 'id name email' },
      { path: 'updatedBy', select: 'id name email' }
    ]);

    // Create audit log
    await AuditLog.create({
      model: "Coupon",
      recordId: couponId,
      userId,
      action: "UPDATE",
      oldValue: JSON.stringify(existingCoupon),
      newValue: JSON.stringify(updatedCoupon),
      details: {
          changes: processedData,
          user: {
            id: session.user?.id,
            name: session.user?.name,
            email: session.user?.email,
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
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const couponId = searchParams.get("couponId");

    if (!couponId) {
      return NextResponse.json(
        { message: "Coupon ID is required" },
        { status: 400 }
      );
    }

    // Check if coupon exists
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 }
      );
    }

    // Check if coupon is used in any orders
    const ordersWithCoupon = await Order.find({
      $or: [
        { appliedCoupon: coupon.code },
        { couponId: couponId }
      ]
    }).limit(1);

    if (ordersWithCoupon.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete coupon that has been used in orders" },
        { status: 400 }
      );
    }

    // Delete coupon
    await Coupon.findByIdAndDelete(couponId);

    // Create audit log
    await AuditLog.create({
      model: "Coupon",
      recordId: couponId,
      userId,
      action: "DELETE",
      oldValue: JSON.stringify(coupon),
      details: {
          deletedCoupon: coupon,
          user: {
            id: session.user?.id,
            name: session.user?.name,
            email: session.user?.email,
          },
        },
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
