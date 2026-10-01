import type { Locale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { JsonLd } from "#components/json-ld";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { Link } from "#i18n/navigation";
import { loadDocument } from "#lib/documents";
import type { DocumentName } from "#lib/documents";
import { getPageUrl } from "#lib/structured-data";

// The policies are written in Japanese, and that text is the one that binds.
const originalLocale: Locale = "ja";

interface DocumentPageProps {
  readonly name: DocumentName;
}

export const DocumentPage = async ({ name }: DocumentPageProps) => {
  const locale = await getLocale();
  const [{ default: Content, frontmatter }, t] = await Promise.all([
    loadDocument(name, locale),
    getTranslations(),
  ]);

  const link = (chunks: ReactNode) => (
    <Link
      className="text-primary underline"
      href={`/${name}`}
      hrefLang={originalLocale}
      locale={originalLocale}
    >
      {chunks}
    </Link>
  );

  return (
    <>
      <JsonLd
        graph={[
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { item: getPageUrl("/", locale), name: t("site.name") },
              { item: getPageUrl(`/${name}`, locale), name: frontmatter.title },
            ].map((crumb, index) => ({
              ...crumb,
              "@type": "ListItem",
              position: index + 1,
            })),
          },
        ]}
      />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
        <article className="text-muted-foreground">
          <h1 className="font-display text-foreground break-phrase text-3xl text-balance sm:text-4xl">
            {frontmatter.title}
          </h1>
          {locale === originalLocale ? null : (
            <p className="border-border mt-6 rounded-md border px-4 py-3 text-sm leading-relaxed">
              {t.rich("documents.referenceTranslation", { link })}
            </p>
          )}
          <Content />
        </article>
      </main>
      <SiteFooter />
    </>
  );
};
