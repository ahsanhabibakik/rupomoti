export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from "@/lib/auth-node";
import dbConnect from '@/lib/mongoose';
import { getCouponModel } from '@/models/Coupon';
import { getOrderModel } from '@/models/Order';
import { getAuditLogModel } from '@/models/AuditLog';
const Coupon = getCouponModel();
const Order = getOrderModel();
const AuditLog = getAuditLogModel();


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

    const body = await req.json();
    const { couponIds } = body;

    if (!couponIds || !Array.isArray(couponIds)) {
      return NextResponse.json(
        { message: "Missing coupon IDs" },
        { status: 400 }
      );
    }

    // Get coupons before deletion for audit log
    const coupons = await Coupon.find({
      _id: { $in: couponIds }
    });

    // Check if any coupons are used in orders
    const ordersWithCoupons = await Order.find({
      $or: [
        { appliedCoupon: { $in: coupons.map(c => c.code) } },
        { couponId: { $in: couponIds } }
      ]
    }).select('_id appliedCoupon couponId').limit(1);

    if (ordersWithCoupons.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete coupons that have been used in orders" },
        { status: 400 }
      );
    }

    // Delete coupons
    const result = await Coupon.deleteMany({
      _id: { $in: couponIds }
    });

    // Create audit logs for bulk delete
    await Promise.all(
      coupons.map(coupon =>
        AuditLog.create({
          model: "Coupon",
          recordId: coupon._id.toString(),
          userId,
          action: "BULK_DELETE",
          oldValue: JSON.stringify(coupon),
          details: {
            deletedCoupon: coupon,
            user: {
              id: session.user?.id,
              name: session.user?.name,
              email: session.user?.email,
            },
          },
        })
      )
    );

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} coupons`,
      count: result.deletedCount
    });
  } catch (error) {
    console.error("Error bulk deleting coupons:", error);
    return NextResponse.json(
      { message: "Failed to delete coupons" },
      { status: 500 }
    );
  }
}