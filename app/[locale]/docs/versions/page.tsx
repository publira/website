import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { Suspense } from "react";
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
  getMajorVersion,
  getMenuVersions,
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

const VersionList = async () => {
  // The docs are read at request time, not in a build.
  await connection();

  const [t, versions, latest] = await Promise.all([
    getTranslations(),
    getDocsVersions(),
    getCurrentVersion(),
  ]);

  // The versions the menu lists, described, then the rest.
  const recent = new Set(getMenuVersions(versions, latest));
  const older = versions.filter((version) => !recent.has(version));

  const describe = (name: string) => {
    if (name === nextVersion) {
      return t.rich("docs.versions.next", { code });
    }

    if (name === latest) {
      return t("docs.versions.latest");
    }

    const major = getMajorVersion(name);

    return major === getMajorVersion(latest)
      ? t("docs.versions.previous", { latest })
      : t("docs.versions.lastOfMajor", { major });
  };

  return (
    <>
      <ul className="border-border divide-border mt-10 divide-y border-y">
        {[...recent].map(({ name }) => (
          <li className="grid grid-cols-[4rem_1fr] gap-x-6 py-4" key={name}>
            <Link
              className="text-primary w-fit font-mono underline-offset-4 hover:underline"
              href={getDocsPath(name)}
            >
              {name}
            </Link>
            <span className="text-muted-foreground text-sm leading-6">
              {describe(name)}
            </span>
          </li>
        ))}
      </ul>
      {older.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-foreground text-xl">
            {t("docs.versions.olderTitle")}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("docs.versions.olderNote")}
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {older.map(({ name }) => (
              <li key={name}>
                <Link
                  className="text-primary font-mono underline-offset-4 hover:underline"
                  href={getDocsPath(name)}
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
};

/** The list's rows while it loads, shaped like the menu's versions. */
const VersionListSkeleton = ({ label }: { readonly label: string }) => (
  <div aria-busy="true" className="mt-10">
    <span className="sr-only">{label}</span>
    <ul className="border-border divide-border divide-y border-y">
      {["w-1/2", "w-2/3", "w-3/5"].map((width) => (
        <li className="grid grid-cols-[4rem_1fr] gap-x-6 py-4" key={width}>
          <span className="bg-border h-6 w-10 animate-pulse rounded-sm" />
          <span className={`bg-border h-6 animate-pulse rounded-sm ${width}`} />
        </li>
      ))}
    </ul>
  </div>
);

const DocsVersions = async () => {
  const [locale, t] = await Promise.all([getRootLocale(), getTranslations()]);
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
        <Suspense fallback={<VersionListSkeleton label={t("docs.loading")} />}>
          <VersionList />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
};

export default DocsVersions;
