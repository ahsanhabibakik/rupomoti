export const runtime = 'nodejs';

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-node";

const handler = NextAuth(authOptions) as any;

export const GET = handler;
export const POST = handler;