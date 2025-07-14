// Edge-compatible auth for middleware and other Edge Runtime contexts
// This version doesn't use Mongoose or any Node.js-specific features

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
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
        // For Edge Runtime, we can't use Mongoose
        // This will be handled by the Node.js auth in API routes
        return null;
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

// For Edge Runtime, we can't use the full auth function
// This is a simplified version for middleware
export const auth = async () => {
  // In Edge Runtime, we can't access the database
  // This will be handled by the Node.js auth in API routes
  return null;
}; 