import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackRustReactCompiler: true,
    useOffline: true,
    useTypeScriptCli: true,
  },
  partialPrefetching: true,
  reactCompiler: true,
};

export default nextConfig;
