// Add this to any API route that uses Prisma to ensure Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Example usage in API routes:
/*
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs' // Force Node.js runtime
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Your Prisma queries here
    const data = await prisma.user.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
*/
