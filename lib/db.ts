import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "20");
    }
    if (parsed.hostname.includes("supabase") && !parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const resolvedDatabaseUrl = databaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(resolvedDatabaseUrl
      ? { datasources: { db: { url: resolvedDatabaseUrl } } }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
