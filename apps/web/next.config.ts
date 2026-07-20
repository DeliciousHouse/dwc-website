import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["@delicious-wines/shared"],
};

export default nextConfig;
