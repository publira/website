import { evaluate } from "@mdx-js/mdx";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";

import {
  docsCacheTags,
  findPage,
  getBlob,
  getDocsTree,
  nextVersion,
  resolveDocsUrl,
} from "#lib/docs";
import type { DocsTree } from "#lib/docs";

import { mdxComponents } from "../mdx-components";

interface MarkdownNode {
  children?: MarkdownNode[];
  type: string;
  url?: string;
}

/** Points the relative links and images of the page at `from` at the site. */
const remarkDocsUrls = (tree: DocsTree, version: string, from: string) => {
  const visit = (node: MarkdownNode) => {
    if (node.url !== undefined) {
      node.url = resolveDocsUrl(tree, version, from, node.url);
    }
    for (const child of node.children ?? []) {
      visit(child);
    }
  };
  return () => visit;
};

interface DocsContentProps {
  readonly slug: readonly string[];
  readonly version: string;
}

/** A page's body, compiled as the site compiles `content/<locale>/*.md`. */
export const DocsContent = async ({ slug, version }: DocsContentProps) => {
  "use cache";
  cacheLife("max");
  cacheTag(
    version === nextVersion ? docsCacheTags.next : docsCacheTags.releases
  );

  const tree = await getDocsTree(version);
  const page = tree && findPage(tree, slug);
  if (!page) {
    notFound();
  }

  const { default: Content } = await evaluate(
    new TextDecoder().decode(await getBlob(page.sha)),
    {
      Fragment,
      format: "md",
      jsx,
      jsxs,
      rehypePlugins: [rehypeSlug],
      remarkPlugins: [
        remarkFrontmatter,
        remarkGfm,
        remarkDocsUrls(tree, version, page.path),
      ],
    }
  );

  return <Content components={mdxComponents} />;
};
