import { NextRequest, NextResponse } from 'next/server'
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';

import bcrypt from 'bcryptjs'

export const POST = withMongoose(async (req) => {
  try {
    const { email, password } = await request.json()
    
    console.log('Testing login for:', email)
    
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' })
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password || '')
    
    return NextResponse.json({
      success: passwordMatch,
      user: passwordMatch ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'ADMIN'
      } : null,
      passwordMatch,
      userRole: user.role
    })
  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
