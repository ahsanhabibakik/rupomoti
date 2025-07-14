export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from "@/app/auth";
import dbConnect from '@/lib/mongoose';
import Coupon from '@/models/Coupon';
import AuditLog from '@/models/AuditLog';



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
    const { action, couponIds } = body;

    if (!action || !couponIds || !Array.isArray(couponIds)) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown> = {};
    
    switch (action) {
      case 'activate':
        updateData.isActive = true;
        break;
      case 'deactivate':
        updateData.isActive = false;
        break;
      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }

    // Update multiple coupons
    const result = await Coupon.updateMany(
      { _id: { $in: couponIds } },
      updateData
    );

    // Create audit logs for bulk update
    const coupons = await Coupon.find({
      _id: { $in: couponIds }
    });

    await Promise.all(
      coupons.map(coupon =>
        AuditLog.create({
          model: "Coupon",
          recordId: coupon._id.toString(),
          userId,
          action: "BULK_UPDATE",
          details: {
            action,
            coupon,
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
      message: `Successfully ${action}d ${result.modifiedCount} coupons`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error("Error bulk updating coupons:", error);
    return NextResponse.json(
      { message: "Failed to update coupons" },
      { status: 500 }
    );
  }
}