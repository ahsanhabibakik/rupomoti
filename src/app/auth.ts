import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  basePath: '/api/auth',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    Credentials({
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

          // Import Mongoose User model
          const { default: User } = await import('../models/User')
          const bcrypt = await import('bcryptjs')
          const mongoose = await import('mongoose')
          
          // Connect to MongoDB if not already connected
          if (mongoose.default.connection.readyState !== 1) {
            const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL
            if (!mongoUri) {
              throw new Error('MongoDB connection string not found')
            }
            await mongoose.default.connect(mongoUri)
          }

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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }) {
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
    signIn: '/auth/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
})
