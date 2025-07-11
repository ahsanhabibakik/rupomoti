import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongooseAdapter } from "@/lib/mongoose-adapter";
import dbConnect from '@/lib/dbConnect';
import { compare } from "bcryptjs";
import User from '@/models/User';

export const authConfig: AuthOptions = {
  adapter: MongooseAdapter(),
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
          throw new Error("Invalid credentials");
        }

        try {
          await dbConnect();
          const user = await User.findOne({
            email: credentials.email
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error('Error in credentials provider:', error);
          throw new Error("Invalid credentials");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
};

export const authOptions = authConfig; 