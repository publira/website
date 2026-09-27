import type { MDXContent } from "mdx/types";
import type { Locale } from "next-intl";

/** A Markdown document under `content/<locale>/`, with its frontmatter. */
interface MarkdownDocument {
  readonly default: MDXContent;
  readonly frontmatter: {
    readonly description: string;
    readonly title: string;
  };
}

export type DocumentName = "privacy" | "terms";

// Each path is spelled out so the bundler splits every document into a chunk
// of its own, and a locale without a document fails the type check.
const documents: Record<
  DocumentName,
  Record<Locale, () => Promise<MarkdownDocument>>
> = {
  privacy: {
    en: () => import("#content/en/privacy.md"),
    ja: () => import("#content/ja/privacy.md"),
    ko: () => import("#content/ko/privacy.md"),
    "zh-Hans": () => import("#content/zh-Hans/privacy.md"),
    "zh-Hant": () => import("#content/zh-Hant/privacy.md"),
  },
  terms: {
    en: () => import("#content/en/terms.md"),
    ja: () => import("#content/ja/terms.md"),
    ko: () => import("#content/ko/terms.md"),
    "zh-Hans": () => import("#content/zh-Hans/terms.md"),
    "zh-Hant": () => import("#content/zh-Hant/terms.md"),
  },
};

export const loadDocument = (name: DocumentName, locale: Locale) =>
  documents[name][locale]();
