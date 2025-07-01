import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { Adapter } from "next-auth/adapters"

// Create a safe adapter that handles edge runtime issues
const createSafeAdapter = () => {
  try {
    if (process.env.NEXT_RUNTIME === 'edge') {
      console.warn('Using JWT-only mode in edge runtime')
      return undefined
    }
    return PrismaAdapter(prisma) as Adapter
  } catch (error) {
    console.error('Failed to create Prisma adapter:', error)
    return undefined
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createSafeAdapter(),
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  basePath: '/api/auth',
  allowDangerousEmailAccountLinking: true, // Allow linking OAuth accounts to existing email accounts
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - optimize session updates
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days - match session
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === 'production',
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax", 
        path: "/",
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === 'production',
      },
    },
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          })

          if (!user || !user.password) {
            throw new Error("Invalid credentials")
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isCorrectPassword) {
            throw new Error("Invalid credentials")
          }

          return user
        } catch (error) {
          console.error("Auth error:", error)
          throw new Error("Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            // User exists, allow sign in but link the account
            return true;
          }
          // New user, allow creation
          return true;
        } catch (error) {
          console.error("Sign in error:", error);
          return false;
        }
      }
      return true;
    },
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name ?? null
        session.user.email = token.email as string
        session.user.image = token.picture ?? null
        session.user.role = token.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN'
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          // If the user is found in the database, populate the token
          if (dbUser) {
            token.id = dbUser.id
            token.name = dbUser.name
            token.email = dbUser.email
            token.picture = dbUser.image
            token.role = dbUser.role
            token.isAdmin =
              dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN'
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error)
          // Continue with basic token info if DB query fails
          token.role = 'USER'
          token.isAdmin = false
        }
      }
      return token
    },
  },
})
