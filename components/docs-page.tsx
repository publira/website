import type { Locale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { JsonLd } from "#components/json-ld";
import { getRootLocale } from "#i18n/locale";
import { Link } from "#i18n/navigation";
import {
  docsSourceLocale,
  findPage,
  getCurrentVersion,
  getDocsNavigation,
  getDocsPage,
  getDocsPath,
  getDocsRedirect,
  getDocsVersions,
  getLocalizedDocsPath,
  hasDocsPage,
  latestVersion,
  nextVersion,
} from "#lib/docs";
import type { DocsNavigationPage } from "#lib/docs";
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

interface DocsPartProps {
  readonly slug: readonly string[];
  /**
   * The version the URL names: `latest` for the newest release reached
   * without one, whose links to its pages then name no version either.
   */
  readonly version: string;
}

/** The page a locale serves at the URL, with the version it is read from. */
const findDocsPage = async ({ slug, version: segment }: DocsPartProps) => {
  const [locale, latest] = await Promise.all([
    getRootLocale(),
    getCurrentVersion(),
  ]);

  const version = segment === latestVersion ? latest : segment;

  return {
    found: await getDocsPage(version, locale, slug),
    latest,
    locale,
    version,
  };
};

/** Where the page stands: an older version, or not yet translated. */
export const DocsNotices = async (props: DocsPartProps) => {
  "use cache: remote";
  cacheLife("max");

  const [{ found, latest, locale, version }, versions] = await Promise.all([
    findDocsPage(props),
    getDocsVersions(),
  ]);

  if (!found) {
    return null;
  }

  const { page } = found;
  const translated = found.language === locale;

  if (version === latest && translated) {
    return null;
  }

  // Only an untranslated page points to a version with its translation: the
  // newest release that has one, or `next`. Failing both, the locale is yet
  // to be translated when `next` has the page at all.
  const [translatedVersion, translationPlanned] = translated
    ? [undefined, false]
    : await Promise.all([
        findTranslatedVersion(
          [
            ...versions.flatMap(({ name }) =>
              name === nextVersion ? [] : [name]
            ),
            nextVersion,
          ],
          locale,
          page.slug
        ),
        hasDocsPage(nextVersion, docsSourceLocale, page.slug),
      ]);

  return (
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
  );
};

/** The title, the dates, and the page's structured data. */
const DocsHeadingView = async ({
  slug,
  version: linkVersion,
}: DocsPartProps) => {
  "use cache: remote";
  cacheLife("max");

  const [{ found, locale, version }, t] = await Promise.all([
    findDocsPage({ slug, version: linkVersion }),
    getTranslations(),
  ]);

  if (!found) {
    return null;
  }

  const { language, page } = found;
  const translated = language === locale;
  const pages = await getDocsNavigation(version, locale);
  const url = getAbsoluteUrl(getLocalizedDocsPath(locale, version, page.slug));

  // The directories' pages above this one.
  const ancestors = page.slug.flatMap((_, index) => {
    const ancestor =
      index < page.slug.length - 1 &&
      findPage({ pages }, page.slug.slice(0, index + 1));

    return ancestor ? [ancestor] : [];
  });

  return (
    // An untranslated article is marked as the source locale's, all but the
    // dates, which are the reader's.
    <header lang={translated ? undefined : language}>
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
      />{" "}
      <h1 className="font-display text-foreground text-3xl text-balance sm:text-4xl">
        {page.title}
      </h1>
      <p
        className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm"
        lang={translated ? undefined : locale}
      >
        <PageDate date={page.published} kind="published" />
        {page.updated ? <PageDate date={page.updated} kind="updated" /> : null}
      </p>
    </header>
  );
};

/**
 * The heading, or for a URL without a page, its redirect when a page lists it
 * in `redirect_from` or it is a version's root, and a 404 otherwise.
 */
export const DocsHeading = async (props: DocsPartProps) => {
  const { slug, version: segment } = props;
  const { found, locale, version } = await findDocsPage(props);

  if (found) {
    return <DocsHeadingView {...props} />;
  }

  // A page renamed or moved lists its former URL in `redirect_from`, which
  // keeps leading to it in every version whose tree says so. A URL without a
  // version leads to one without a version, so it never pins a release.
  const target =
    slug.length > 0 ? await getDocsRedirect(version, locale, slug) : null;

  if (target) {
    permanentRedirect(getLocalizedDocsPath(locale, segment, target));
  }

  // A version without a root `index.md` opens at its first page.
  const [first] =
    slug.length === 0 ? await getDocsNavigation(version, locale) : [];

  if (first) {
    redirect(getLocalizedDocsPath(locale, segment, first.slug));
  }

  notFound();
};

/** The links to the pages before and after this one. */
export const DocsAdjacentPages = async (props: DocsPartProps) => {
  "use cache: remote";
  cacheLife("max");

  const [{ found, locale, version }, t] = await Promise.all([
    findDocsPage(props),
    getTranslations(),
  ]);

  if (!found) {
    return null;
  }

  const linkVersion = props.version;
  const pages = await getDocsNavigation(version, locale);
  const position = pages.findIndex(({ path }) => path === found.page.path);
  const previous = pages[position - 1];
  const next = pages[position + 1];

  if (!(previous || next)) {
    return null;
  }

  return (
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
  );
};
