// Prisma can sometimes resolve to the "client" engine in Next.js builds, which requires Accelerate/adapter.
// We keep Prisma **lazy** so Next's build-time module evaluation doesn't instantiate it.
let prismaSingleton: unknown;

export function getPrisma() {
  // Default to native engine unless explicitly overridden.
  process.env.PRISMA_CLIENT_ENGINE_TYPE ??= "binary";

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");

  const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> };
  const cached = process.env.NODE_ENV !== "production" ? globalForPrisma.prisma : (prismaSingleton as InstanceType<typeof PrismaClient> | undefined);

  const prisma =
    cached ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  else prismaSingleton = prisma;

  return prisma;
}

