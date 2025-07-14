export const runtime = 'nodejs';

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"

// Dynamic imports to avoid Edge Runtime issues
async function getAuthOptions(): Promise<NextAuthOptions> {
  const { getUserModel } = await import('@/models/User');
  const { getAccountModel } = await import('@/models/Account');
  const { getSessionModel } = await import('@/models/Session');
  const { getVerificationTokenModel } = await import('@/models/VerificationToken');
  const { default: dbConnect } = await import('../lib/mongoose');

  return {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          try {
            await dbConnect();
            const User = getUserModel();
            
            const user = await User.findOne({ email: credentials.email }).select('+password');
            
            if (!user || !user.password) {
              return null;
            }

            // For now, we'll do a simple comparison. In production, use bcrypt
            if (user.password !== credentials.password) {
              return null;
            }

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              image: user.image,
            };
          } catch (error) {
            console.error('Auth error:', error);
            return null;
          }
        }
      })
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
    pages: {
      signIn: '/signin',
    },
  };
}

export const authOptions = await getAuthOptions();

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions); 