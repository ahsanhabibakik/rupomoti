import { NextResponse } from "next/server";
import { auth } from "@/app/auth";



export async function PATCH(req: Request) {
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
    const result = await prisma.coupon.updateMany({
      where: {
        id: { in: couponIds }
      },
      data: updateData
    });

    // Create audit logs for bulk update
    const coupons = await prisma.coupon.findMany({
      where: { id: { in: couponIds } }
    });

    await Promise.all(
      coupons.map(coupon =>
        prisma.auditLog.create({
          data: {
            model: "Coupon",
            recordId: coupon.id,
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
          },
        })
      )
    );

    return NextResponse.json({
      message: `Successfully ${action}d ${result.count} coupons`,
      count: result.count
    });
  } catch (error) {
    console.error("Error bulk updating coupons:", error);
    return NextResponse.json(
      { message: "Failed to update coupons" },
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