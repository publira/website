import { evaluate } from "@mdx-js/mdx";
import remarkSugarHigh from "@sugar-high/remark";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { lang } from "sugar-high/lang";

import { getRootLocale } from "#i18n/locale";
import {
  docsCacheTags,
  docsSourceLocale,
  resolveDocsImage,
  findPage,
  getBlob,
  getDocsTree,
  getDocsImageSize,
  nextVersion,
  resolveDocsUrl,
} from "#lib/docs";
import type { DocsTrees } from "#lib/docs";

import { imageClassName, mdxComponents } from "../mdx-components";

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
  (trees: DocsTrees, version: string, from: string) =>
  () =>
  (root: MarkdownNode) =>
    visit(root, (node) => {
      if (node.url !== undefined) {
        node.url = resolveDocsUrl(trees, version, from, node.url);
      }
    });

/**
 * Gives each image of the trees its intrinsic size, so that it takes its space
 * before it loads. Runs before `remarkDocsUrls` rewrites the URLs.
 */
const remarkDocsImageSizes =
  (trees: DocsTrees, from: string) => () => async (root: MarkdownNode) => {
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
          url === undefined ? null : resolveDocsImage(trees, from, url);
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

/** The properties of a Markdown image, which MDX hands over as strings. */
interface MarkdownImageProps {
  readonly alt?: string;
  readonly height?: string;
  readonly src?: string;
  readonly title?: string;
  readonly width?: string;
}

/**
 * An image of the tree at the width the text column (`max-w-3xl`) shows it.
 * Only those get a size from `remarkDocsImageSizes`, and with it a URL that
 * `images.localPatterns` allows.
 */
const DocsImage = (props: MarkdownImageProps) => {
  const { alt = "", src, title } = props;
  const height = Number(props.height);
  const width = Number(props.width);
  if (!(src && height > 0 && width > 0)) {
    return mdxComponents.img(props);
  }

  // `next/image` serves an SVG as it is only when `src` ends in `.svg`, and
  // `localPatterns` allows no query.
  const [file] = src.split(/[?#]/u, 1);
  return (
    <Image
      alt={alt}
      // Shows where the image will be until it loads, then lies under it.
      className={`${imageClassName} bg-muted`}
      height={height}
      sizes="(min-width: 48rem) 48rem, 100vw"
      src={src}
      title={title}
      unoptimized={file !== src || file.endsWith(".svg")}
      width={width}
    />
  );
};

const docsComponents = { ...mdxComponents, img: DocsImage };

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

  const locale = await getRootLocale();
  const [tree, source] = await Promise.all([
    getDocsTree(version, locale),
    locale === docsSourceLocale ? null : getDocsTree(version, docsSourceLocale),
  ]);
  const page = tree && findPage(tree, slug);
  if (!page) {
    notFound();
  }
  const trees: DocsTrees = source ? [tree, source] : [tree];

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
        remarkDocsImageSizes(trees, page.path),
        remarkDocsUrls(trees, version, page.path),
        remarkPlaintextFences,
        remarkSugarHigh,
      ],
    }
  );

  return <Content components={docsComponents} />;
};
