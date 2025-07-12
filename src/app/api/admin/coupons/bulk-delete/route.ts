import { NextResponse } from "next/server";
import { auth } from "@/app/auth";



export async function DELETE(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !["SUPER_ADMIN", "ADMIN"].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { couponIds } = body;

    if (!couponIds || !Array.isArray(couponIds)) {
      return NextResponse.json(
        { message: "Missing coupon IDs" },
        { status: 400 }
      );
    }

    // Get coupons before deletion for audit log
    const coupons = await prisma.coupon.findMany({
      where: { id: { in: couponIds } }
    });

    // Check if any coupons are used in orders
    const ordersWithCoupons = await prisma.order.findMany({
      where: { 
        OR: [
          { appliedCoupon: { in: coupons.map(c => c.code) } },
          { couponId: { in: couponIds } }
        ]
      },
      select: { id: true, appliedCoupon: true, couponId: true },
      take: 1,
    });

    if (ordersWithCoupons.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete coupons that have been used in orders" },
        { status: 400 }
      );
    }

    // Delete coupons
    const result = await prisma.coupon.deleteMany({
      where: {
        id: { in: couponIds }
      }
    });

    // Create audit logs for bulk delete
    await Promise.all(
      coupons.map(coupon =>
        prisma.auditLog.create({
          data: {
            model: "Coupon",
            recordId: coupon.id,
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
          },
        })
      )
    );

    return NextResponse.json({
      message: `Successfully deleted ${result.count} coupons`,
      count: result.count
    });
  } catch (error) {
    console.error("Error bulk deleting coupons:", error);
    return NextResponse.json(
      { message: "Failed to delete coupons" },
      { status: 500 }
    );
  }
}
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}} catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}