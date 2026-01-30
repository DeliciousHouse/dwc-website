// Prisma can sometimes resolve to the "client" engine in Next.js builds, which requires Accelerate/adapter.
// We keep Prisma **lazy** so Next's build-time module evaluation doesn't instantiate it.
let prismaSingleton: InstanceType<import("@prisma/client").PrismaClient> | undefined;

type GlobalPrisma = typeof globalThis & {
  prisma?: InstanceType<import("@prisma/client").PrismaClient>;
  prismaPool?: import("pg").Pool;
};

export function getPrisma() {
  // Prisma 7 "client" engine requires a driver adapter (or Accelerate URL). In local Docker dev we
  // repeatedly see Prisma selecting the client engine, so we always provide an adapter.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = require("pg") as typeof import("pg");

  const globalForPrisma = globalThis as GlobalPrisma;
  const cached =
    process.env.NODE_ENV !== "production"
      ? globalForPrisma.prisma
      : prismaSingleton;

  const databaseUrl = process.env.DATABASE_URL;
  const pool =
    databaseUrl
      ? globalForPrisma.prismaPool ?? new Pool({ connectionString: databaseUrl })
      : undefined;

  if (process.env.NODE_ENV !== "production" && pool) {
    globalForPrisma.prismaPool = pool;
  }

  const prisma =
    cached ??
    new PrismaClient({
      adapter: pool ? new PrismaPg(pool) : undefined,
      log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  else prismaSingleton = prisma;

  return prisma;
}

