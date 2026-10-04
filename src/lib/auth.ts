// src/lib/auth.ts
// NextAuth v5 (beta) configuration with Google & Credentials demo provider

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

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
      name: "Email / Demo",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@storebuilder.com" },
        name: { label: "Name", type: "text", placeholder: "Alex Mercer" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const name = credentials.name ? String(credentials.name).trim() : email.split("@")[0];

        try {
          const user = await prisma.user.upsert({
            where: { email },
            update: { name },
            create: {
              email,
              name,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            },
          });
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
          };
        } catch (e) {
          console.error("[Auth] Credentials authorize error:", e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider === "google") {
        try {
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name ?? undefined,
              avatar: user.image ?? undefined,
              googleId: account.providerAccountId,
            },
            create: {
              email: user.email,
              name: user.name ?? null,
              avatar: user.image ?? null,
              googleId: account.providerAccountId,
            },
          });
        } catch (error) {
          console.error("[Auth] Google signIn error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, email: true, name: true, avatar: true },
          });
          if (dbUser) {
            token.userId = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name ?? token.name;
            token.picture = dbUser.avatar ?? token.picture;
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
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-store-builder-saas-2025-token",
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
