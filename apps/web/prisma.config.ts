import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma config validation fails hard if env() can't resolve at build time.
    // A default keeps `prisma generate` workable in CI/build contexts.
    url: process.env.DATABASE_URL ?? "postgresql://dwc:dwc@localhost:5432/dwc?schema=public",
  },
});

