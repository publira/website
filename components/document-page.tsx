import { getLocale } from "next-intl/server";

import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { loadDocument } from "#lib/documents";
import type { DocumentName } from "#lib/documents";

interface DocumentPageProps {
  readonly name: DocumentName;
}

export const DocumentPage = async ({ name }: DocumentPageProps) => {
  const { default: Content, frontmatter } = await loadDocument(
    name,
    await getLocale()
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
        <article className="text-muted-foreground">
          <h1 className="font-display text-foreground break-phrase text-3xl text-balance sm:text-4xl">
            {frontmatter.title}
          </h1>
          <Content />
        </article>
      </main>
      <SiteFooter />
    </>
  );
};
