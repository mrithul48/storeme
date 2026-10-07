// src/lib/auth.ts
// NextAuth v5 (beta) configuration — Google OAuth + Email/Password credentials.
// Sessions are JWTs stored in HTTP-only, SameSite=Lax cookies (Secure in production) managed by NextAuth.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/validations/auth.schema";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET / NEXTAUTH_SECRET must be set in production");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, avatar: true, password: true },
          });

          // Google-only accounts have no password → credentials login is rejected.
          // verifyPassword is still executed on a miss to reduce user-enumeration timing differences.
          const ok = await verifyPassword(
            password,
            user?.password ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="
          );
          if (!user || !user.password || !ok) return null;

          return { id: user.id, email: user.email, name: user.name, image: user.avatar };
        } catch (e) {
          console.error("[Auth] Credentials authorize error:", e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider === "google") {
        const email = user.email.toLowerCase();
        try {
          const existing = await prisma.user.findUnique({
            where: { email },
            select: { id: true, emailVerified: true, password: true },
          });

          if (existing) {
            await prisma.user.update({
              where: { id: existing.id },
              data: {
                name: user.name ?? undefined,
                avatar: user.image ?? undefined,
                googleId: account.providerAccountId,
                emailVerified: true,
                // Pre-account-takeover protection: if someone registered this email with a password
                // before ownership was ever verified, invalidate that password now that Google
                // has proven the real owner.
                ...(existing.password && !existing.emailVerified ? { password: null } : {}),
              },
            });
          } else {
            await prisma.user.create({
              data: {
                email,
                name: user.name ?? null,
                avatar: user.image ?? null,
                googleId: account.providerAccountId,
                emailVerified: true,
              },
            });
          }
        } catch (error) {
          console.error("[Auth] Google signIn error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      const email = (user?.email || token.email) as string | undefined;
      if (email && (!token.userId || user)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true, email: true, name: true, avatar: true, role: true },
          });
          if (dbUser) {
            token.userId = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name ?? token.name;
            token.picture = dbUser.avatar ?? token.picture;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("[Auth] jwt lookup error:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as "USER" | "PLATFORM_ADMIN") ?? "USER";
      } else if (token.sub) {
        session.user.id = token.sub;
      }

      // Synchronize session.user.id with canonical database User.id so any stale JWT token is automatically corrected
      if (session?.user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email.toLowerCase() },
            select: { id: true, role: true },
          });
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.role = dbUser.role;
          }
        } catch (e) {
          console.error("[Auth] session dbUser sync error:", e);
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  secret: authSecret,
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "USER" | "PLATFORM_ADMIN";
    };
  }
}
