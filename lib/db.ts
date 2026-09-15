import "server-only";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function prismaDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return url;
  }

  const params: string[] = [];
  if (url.includes(":6543") && !/[?&]pgbouncer=/.test(url)) {
    params.push("pgbouncer=true");
  }
  if (!/[?&]connection_limit=/.test(url)) {
    params.push("connection_limit=1");
  }
  if (params.length === 0) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.join("&")}`;
}

const resolvedDatabaseUrl = prismaDatabaseUrl();

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
