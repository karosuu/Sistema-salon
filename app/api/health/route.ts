import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function databaseHost(): string {
  const raw = process.env.DATABASE_URL?.trim() ?? "";
  if (!raw) {
    return "missing";
  }

  try {
    return new URL(raw).host || "unparseable";
  } catch {
    if (raw.startsWith('"') || raw.startsWith("'")) {
      return "quoted";
    }
    return "unparseable";
  }
}

export async function GET() {
  let services = -1;
  let admins = -1;
  let prismaError: string | null = null;

  try {
    const [serviceCount, adminCount] = await Promise.all([
      prisma.service.count(),
      prisma.adminUser.count(),
    ]);
    services = serviceCount;
    admins = adminCount;
  } catch (error) {
    prismaError = error instanceof Error ? error.message.slice(0, 240) : "error";
  }

  return Response.json({
    ok: prismaError === null,
    databaseHost: databaseHost(),
    services,
    admins,
    prismaError,
  });
}
