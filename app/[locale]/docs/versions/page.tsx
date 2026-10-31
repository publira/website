import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { JsonLd } from "#components/json-ld";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { getRootLocale } from "#i18n/locale";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import { Link } from "#i18n/navigation";
import {
  docsVersionsPath,
  getCurrentVersion,
  getDocsPath,
  getDocsVersions,
  nextVersion,
} from "#lib/docs";
import { getPageUrl } from "#lib/structured-data";

export const generateMetadata = async (): Promise<Metadata> => {
  const [locale, t] = await Promise.all([getRootLocale(), getTranslations()]);
  const title = t("docs.versions.metadata.title");

  return {
    alternates: getAlternates(docsVersionsPath, locale),
    description: t("docs.versions.metadata.description"),
    openGraph: getOpenGraph(docsVersionsPath, locale, {
      siteName: t("site.name"),
      title,
    }),
    title,
  };
};

const code = (chunks: ReactNode) => <code>{chunks}</code>;

const DocsVersions = async () => {
  const [locale, t, versions, latest] = await Promise.all([
    getRootLocale(),
    getTranslations(),
    getDocsVersions(),
    getCurrentVersion(),
  ]);

  const title = t("docs.versions.metadata.title");

  return (
    <>
      <JsonLd
        graph={[
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { item: getPageUrl("/", locale), name: t("site.name") },
              {
                item: getPageUrl(docsVersionsPath, locale),
                name: title,
              },
            ].map((crumb, index) => ({
              ...crumb,
              "@type": "ListItem",
              position: index + 1,
            })),
          },
        ]}
      />
      <SiteHeader section="docs" />
      <main className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
        <h1 className="font-display text-foreground text-3xl text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          {t("docs.versions.lead")}
        </p>
        <ul className="mt-10 space-y-3">
          {versions.map(({ name }) => (
            <li className="flex flex-wrap items-baseline gap-x-3" key={name}>
              <Link
                className="text-primary font-mono underline-offset-4 hover:underline"
                href={getDocsPath(name)}
              >
                {name}
              </Link>
              {name === nextVersion ? (
                <span className="text-muted-foreground text-sm">
                  {t.rich("docs.versions.next", { code })}
                </span>
              ) : null}
              {name === latest ? (
                <span className="text-muted-foreground text-sm">
                  {t("docs.versions.latest")}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
};

export default DocsVersions;
