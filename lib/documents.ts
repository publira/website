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
  },
  terms: {
    en: () => import("#content/en/terms.md"),
    ja: () => import("#content/ja/terms.md"),
  },
};

export const loadDocument = (name: DocumentName, locale: Locale) =>
  documents[name][locale]();
