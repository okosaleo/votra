import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./lib/prisma";
import { openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!, 
    "https://localhost:10000",
  ],
  rateLimit: {
    window: 10,
    max: 100, 
},
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 12,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 * 60
  }
  },
  plugins: [openAPI(), nextCookies(), admin({
    impersonationSessionDuration: 60 * 60 * 24 * 7, 
  })],
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
});

export type Session = typeof auth.$Infer.Session
