import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin the workspace root so stray lockfiles outside the repo can't confuse it.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
