import NextAuth from "next-auth/next"
import { authConfig } from "./auth-config"

// Add NEXTAUTH_SECRET and debug to the config
const config = {
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(config)

export { handler as GET, handler as POST }