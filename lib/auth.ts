import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth";

import { ADMIN_ROUTES } from "@/lib/constants";
import { loginSchema } from "@/lib/validations/auth";

const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
if (vercelHost) {
  process.env.NEXTAUTH_URL = `https://${vercelHost}`;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  pages: {
    signIn: ADMIN_ROUTES.login,
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) {
          return null;
        }

        const { prisma } = await import("@/lib/db");

        try {
          const admin = await prisma.adminUser.findUnique({
            where: { email: parsed.data.email.toLowerCase() },
          });

          if (!admin) {
            return null;
          }

          const matches = await compare(parsed.data.password, admin.passwordHash);
          if (!matches) {
            return null;
          }

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
          };
        } catch (error) {
          console.error("[auth] no se pudo consultar AdminUser", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = "admin";
      }
      return session;
    },
  },
};

export function getAdminSession() {
  return getServerSession(authOptions);
}
