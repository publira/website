import type { Locale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import type { ReactNode } from "react";

import { DocsContent } from "#components/docs-content";
import { JsonLd } from "#components/json-ld";
import { getRootLocale } from "#i18n/locale";
import { Link } from "#i18n/navigation";
import {
  docsSourceLocale,
  findPage,
  getCurrentVersion,
  getDocsNavigation,
  getDocsPath,
  getDocsVersions,
  getLocalizedDocsPath,
  hasDocsPage,
  latestVersion,
  nextVersion,
} from "#lib/docs";
import type { DocsNavigationPage, DocsPage as DocsPageData } from "#lib/docs";
import { getAbsoluteUrl } from "#lib/site";
import { getPageUrl, getWebSiteId, organizationId } from "#lib/structured-data";

interface VersionNoticeProps {
  readonly latest: string;
  readonly version: string;
}

const code = (chunks: ReactNode) => <code>{chunks}</code>;

/** Where a page outside the newest release stands, and a way to the newest. */
const VersionNotice = async ({ latest, version }: VersionNoticeProps) => {
  const t = await getTranslations("docs");

  const link = (chunks: ReactNode) => (
    <Link className="text-primary underline" href={getDocsPath(latest)}>
      {chunks}
    </Link>
  );

  return (
    <p className="border-border rounded-md border px-4 py-3 text-sm leading-relaxed">
      {t.rich(version === nextVersion ? "nextNotice" : "olderNotice", {
        code,
        latest,
        link,
        version,
      })}
    </p>
  );
};

interface TranslatedInVersionNoticeProps {
  readonly slug: readonly string[];
  /** A version that has the page in the reader's locale. */
  readonly version: string;
}

/** That the page is shown in the source locale, and a way to its translation. */
const TranslatedInVersionNotice = async ({
  slug,
  version,
}: TranslatedInVersionNoticeProps) => {
  const t = await getTranslations("docs");

  const link = (chunks: ReactNode) => (
    <Link className="text-primary underline" href={getDocsPath(version, slug)}>
      {chunks}
    </Link>
  );

  return (
    <p className="border-border rounded-md border px-4 py-3 text-sm leading-relaxed">
      {t.rich("translatedInVersionNotice", { link, version })}
    </p>
  );
};

/** publira/publira's Issue for translating the locales without a tree yet. */
const translationIssueLink = (chunks: ReactNode) => (
  <a
    className="text-primary underline"
    href="https://github.com/publira/publira/issues/4075"
  >
    {chunks}
  </a>
);

interface TranslationNoticeProps {
  /** Whether the reader's locale is yet to be translated at all. */
  readonly planned: boolean;
  readonly slug: readonly string[];
  /** A version that has the page in the reader's locale. */
  readonly translatedVersion: string | undefined;
}

/** That the page is shown in the source locale until it is translated. */
const TranslationNotice = async ({
  planned,
  slug,
  translatedVersion,
}: TranslationNoticeProps) => {
  if (translatedVersion) {
    return (
      <TranslatedInVersionNotice slug={slug} version={translatedVersion} />
    );
  }

  const t = await getTranslations("docs");

  return (
    <p className="border-border rounded-md border px-4 py-3 text-sm leading-relaxed">
      {planned
        ? t.rich("translationPlannedNotice", { link: translationIssueLink })
        : t("untranslatedNotice")}
    </p>
  );
};

interface AdjacentPageLinkProps {
  readonly label: string;
  readonly page: DocsNavigationPage;
  readonly rel: "next" | "prev";
  readonly version: string;
}

const AdjacentPageLink = ({
  label,
  page,
  rel,
  version,
}: AdjacentPageLinkProps) => (
  <Link
    className={`border-border hover:bg-accent block rounded-md border px-4 py-3 ${rel === "next" ? "sm:col-start-2 sm:text-right" : ""}`}
    href={getDocsPath(version, page.slug)}
    prefetch
    rel={rel}
  >
    <span className="text-muted-foreground block text-sm">{label}</span>
    <span
      className="text-foreground mt-1 block font-medium"
      lang={page.language}
    >
      {page.title}
    </span>
  </Link>
);

interface PageDateProps {
  readonly date: string;
  readonly kind: "published" | "updated";
}

const PageDate = async ({ date, kind }: PageDateProps) => {
  const [t, format] = await Promise.all([
    getTranslations("docs"),
    getFormatter(),
  ]);

  const time = (chunks: ReactNode) => <time dateTime={date}>{chunks}</time>;

  return (
    <span>
      {t.rich(kind, {
        date: format.dateTime(new Date(date), {
          dateStyle: "long",
          timeZone: "UTC",
        }),
        time,
      })}
    </span>
  );
};

/** The first of `versions` whose tree has the page in `locale`. */
const findTranslatedVersion = async (
  versions: readonly string[],
  locale: Locale,
  slug: readonly string[]
): Promise<string | undefined> => {
  const [version, ...rest] = versions;

  if (version === undefined || (await hasDocsPage(version, locale, slug))) {
    return version;
  }

  return findTranslatedVersion(rest, locale, slug);
};

interface DocsArticleProps {
  /** The locale the page is written in: the source locale's until translated. */
  readonly language: Locale;
  readonly page: DocsPageData;
  /**
   * The version the URL names: `latest` for the newest release reached
   * without one, whose links to its pages then name no version either.
   */
  readonly version: string;
}

/** A docs page's notices, article, and links to the pages next to it. */
export const DocsArticle = async ({
  language,
  page,
  version: linkVersion,
}: DocsArticleProps) => {
  "use cache: remote";
  cacheLife("max");

  const [locale, t, latest, versions] = await Promise.all([
    getRootLocale(),
    getTranslations(),
    getCurrentVersion(),
    getDocsVersions(),
  ]);

  const version = linkVersion === latestVersion ? latest : linkVersion;
  const translated = language === locale;

  // Only an untranslated page points to a version with its translation: the
  // newest release that has one, or `next`. Failing both, the locale is yet
  // to be translated when `next` has the page at all.
  const [pages, translatedVersion, translationPlanned] = await Promise.all([
    getDocsNavigation(version, locale),
    translated
      ? undefined
      : findTranslatedVersion(
          [
            ...versions.flatMap(({ name }) =>
              name === nextVersion ? [] : [name]
            ),
            nextVersion,
          ],
          locale,
          page.slug
        ),
    !translated && hasDocsPage(nextVersion, docsSourceLocale, page.slug),
  ]);

  const url = getAbsoluteUrl(getLocalizedDocsPath(locale, version, page.slug));

  // The directories' pages above this one.
  const ancestors = page.slug.flatMap((_, index) => {
    const ancestor =
      index < page.slug.length - 1 &&
      findPage({ pages }, page.slug.slice(0, index + 1));

    return ancestor ? [ancestor] : [];
  });

  const position = pages.findIndex(({ path }) => path === page.path);
  const previous = pages[position - 1];
  const next = pages[position + 1];

  return (
    <>
      <JsonLd
        graph={[
          {
            "@id": `${url}#article`,
            "@type": "TechArticle",
            dateModified: page.updated,
            datePublished: page.published,
            description: page.description,
            headline: page.title,
            inLanguage: language,
            isPartOf: { "@id": getWebSiteId(locale) },
            publisher: { "@id": organizationId },
            url,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { item: getPageUrl("/", locale), name: t("site.name") },
              ...[...ancestors, page].map((crumb) => ({
                item: getAbsoluteUrl(
                  getLocalizedDocsPath(locale, version, crumb.slug)
                ),
                name: crumb.title,
              })),
            ].map((crumb, index) => ({
              ...crumb,
              "@type": "ListItem",
              position: index + 1,
            })),
          },
        ]}
      />
      {version === latest && translated ? null : (
        <div className="mb-8 space-y-3">
          {version === latest ? null : (
            <VersionNotice latest={latest} version={version} />
          )}
          {translated ? null : (
            <TranslationNotice
              planned={translationPlanned}
              slug={page.slug}
              translatedVersion={translatedVersion}
            />
          )}
        </div>
      )}
      {/* An untranslated article is marked as the source locale's, all
          but the dates, which are the reader's. */}
      <article
        className="text-muted-foreground"
        lang={translated ? undefined : language}
      >
        <h1 className="font-display text-foreground text-3xl text-balance sm:text-4xl">
          {page.title}
        </h1>
        <p
          className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm"
          lang={translated ? undefined : locale}
        >
          <PageDate date={page.published} kind="published" />
          {page.updated ? (
            <PageDate date={page.updated} kind="updated" />
          ) : null}
        </p>
        <DocsContent slug={page.slug} version={linkVersion} />
      </article>
      {previous || next ? (
        <nav
          aria-label={t("docs.adjacentPagesLabel")}
          className="border-border mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2"
        >
          {previous ? (
            <AdjacentPageLink
              label={t("docs.previousPage")}
              page={previous}
              rel="prev"
              version={linkVersion}
            />
          ) : null}
          {next ? (
            <AdjacentPageLink
              label={t("docs.nextPage")}
              page={next}
              rel="next"
              version={linkVersion}
            />
          ) : null}
        </nav>
      ) : null}
    </>
  );
};
