import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["@delicious-wines/shared"],
  env: {
    // Ensure Prisma's engine selection isn't inlined as "client" during builds.
    PRISMA_CLIENT_ENGINE_TYPE: process.env.PRISMA_CLIENT_ENGINE_TYPE ?? "binary",
  },
};

export default nextConfig;
