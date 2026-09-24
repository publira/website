import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

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

export default withNextIntl(nextConfig);
