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
    // `components/docs-content.tsx` parses the documentation the same way.
    remarkPlugins: [
      "remark-frontmatter",
      "remark-gfm",
      "remark-mdx-frontmatter",
    ],
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
  // See `app/map.xml/route.ts` (vercel/next.js#99055).
  rewrites: () => [{ destination: "/map.xml", source: "/sitemap.xml" }],
};

export default withNextIntl(withMDX(nextConfig));
