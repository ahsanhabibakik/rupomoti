import { NextRequest, NextResponse } from 'next/server'
const { auth } = await import('@/app/auth');



export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await auth()
    
    console.log('🔐 Audit Logs API - Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      role: session?.user?.role,
      isAdmin: session?.user?.isAdmin,
    });
    
    if (!session?.user?.id) {
      console.log('❌ No authenticated user');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 })
    }
    
    // Check admin access - allow any admin user or specific roles
    const hasAdminAccess = session?.user?.isAdmin || 
                          session?.user?.role === 'ADMIN' || 
                          session?.user?.role === 'MANAGER' ||
                          session?.user?.role === 'SUPER_ADMIN';
    
    if (!hasAdminAccess) {
      console.log('❌ User does not have admin access:', {
        isAdmin: session?.user?.isAdmin,
        role: session?.user?.role
      });
      return NextResponse.json({ error: 'Unauthorized - Insufficient permissions' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    console.log('📋 Audit Logs API - Query parameters:', { orderId });

    if (!orderId) {
      console.log('❌ Missing orderId parameter');
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    console.log('🔍 Fetching audit logs for order:', orderId);

    // First check total audit logs in database
    const totalAuditLogs = await prisma.auditLog.count();
    console.log('📊 Total audit logs in database:', totalAuditLogs);

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        recordId: orderId,
        model: 'Order'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    console.log('📊 Audit Logs found for order:', auditLogs.length);

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}