import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import User from '../models/User'
import bcrypt from 'bcryptjs'
import dbConnect from '../lib/mongoose'

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string
          const password = credentials?.password as string
          
          if (!email || !password) {
            throw new Error('Email and password are required')
          }

          // Connect to MongoDB
          await dbConnect()

          // Find user by email
          const user = await User.findOne({ email: email.toLowerCase() })
          if (!user || !user.password) {
            throw new Error('Invalid credentials')
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) {
            throw new Error('Invalid credentials')
          }

          // Return user object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: user.role,
            isAdmin: user.isAdmin
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user && user.id) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN'
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
}

export { authOptions };
export const auth = authOptions;
