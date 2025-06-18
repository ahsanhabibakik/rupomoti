import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      role: "USER" | "MANAGER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "USER" | "MANAGER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "MANAGER" | "ADMIN";
    id?: string;
  }
} 