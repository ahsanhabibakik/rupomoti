import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Define our own Role type instead of importing from Prisma
type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    isAdmin: boolean;
  }
} 