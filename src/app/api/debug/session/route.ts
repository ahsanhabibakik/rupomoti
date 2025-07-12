import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      session,
      user: session?.user,
      role: session?.user?.role,
      isAdmin: session?.user?.isAdmin,
    })
  } catch (error) {
    console.error('Session debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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