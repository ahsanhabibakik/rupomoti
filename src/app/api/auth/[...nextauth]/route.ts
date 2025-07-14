export const runtime = 'nodejs';

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-node'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
