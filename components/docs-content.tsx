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
  resolveDocsImage,
  findPage,
  getBlob,
  getDocsTree,
  getDocsImageSize,
  nextVersion,
  resolveDocsUrl,
} from "#lib/docs";
import type { DocsTree } from "#lib/docs";

import { mdxComponents } from "../mdx-components";

interface MarkdownNode {
  children?: MarkdownNode[];
  data?: { hProperties?: { height?: number; width?: number } };
  identifier?: string;
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

/**
 * Gives each image of the tree its intrinsic size, so that it takes its space
 * before it loads. Runs before `remarkDocsUrls` rewrites the URLs.
 */
const remarkDocsImageSizes =
  (tree: DocsTree, from: string) => () => async (root: MarkdownNode) => {
    const definitions = new Map<string | undefined, string | undefined>();
    const images: MarkdownNode[] = [];
    visit(root, (node) => {
      if (node.type === "definition") {
        definitions.set(node.identifier, node.url);
      } else if (node.type === "image" || node.type === "imageReference") {
        images.push(node);
      }
    });

    await Promise.all(
      images.map(async (node) => {
        const url = node.url ?? definitions.get(node.identifier);
        const image =
          url === undefined ? null : resolveDocsImage(tree, from, url);
        const size = image && (await getDocsImageSize(image));
        if (size) {
          node.data = {
            ...node.data,
            hProperties: { ...node.data?.hProperties, ...size },
          };
        }
      })
    );
  };

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
        remarkDocsImageSizes(tree, page.path),
        remarkDocsUrls(tree, version, page.path),
        remarkPlaintextFences,
        remarkSugarHigh,
      ],
    }
  );

  return <Content components={mdxComponents} />;
};
