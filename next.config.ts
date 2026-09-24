import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const withMDX = createMDX({
  extension: /\.mdx?$/u,
  options: {
    // `.md` is parsed as plain Markdown, so a stray `<` or `{` in a
    // translation is text rather than JSX.
    format: "detect",
    // Turbopack takes plugins by name, since functions cannot cross into Rust.
    remarkPlugins: ["remark-frontmatter", "remark-mdx-frontmatter"],
  },
});

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

export default withNextIntl(withMDX(nextConfig));
