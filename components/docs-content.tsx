import { evaluate } from "@mdx-js/mdx";
import remarkSugarHigh from "@sugar-high/remark";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { lang } from "sugar-high/lang";

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
  lang?: string | null;
  type: string;
  url?: string;
}

const visit = (node: MarkdownNode, visitor: (node: MarkdownNode) => void) => {
  visitor(node);
  for (const child of node.children ?? []) {
    visit(child, visitor);
  }
};

/** Points the relative links and images of the page at `from` at the site. */
const remarkDocsUrls =
  (tree: DocsTree, version: string, from: string) =>
  () =>
  (root: MarkdownNode) =>
    visit(root, (node) => {
      if (node.url !== undefined) {
        node.url = resolveDocsUrl(tree, version, from, node.url);
      }
    });

/** Sugar High reads a fence in a language it lacks as JavaScript. */
const remarkPlaintextFences = () => (root: MarkdownNode) =>
  visit(root, (node) => {
    if (node.type === "code" && !lang(node.lang ?? "")) {
      node.lang = "plaintext";
    }
  });

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
        remarkPlaintextFences,
        remarkSugarHigh,
      ],
    }
  );

  return <Content components={mdxComponents} />;
};
