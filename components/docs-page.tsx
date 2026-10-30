import type { Locale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { DocsContent } from "#components/docs-content";
import { DocsNavigation } from "#components/docs-navigation";
import { JsonLd } from "#components/json-ld";
import { Menu } from "#components/menu";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { getRootLocale } from "#i18n/locale";
import { Link } from "#i18n/navigation";
import {
  docsSourceLocale,
  findPage,
  getCurrentVersion,
  getDocsNavigation,
  getDocsPageLocales,
  getDocsPath,
  getDocsVersions,
  getLocalizedDocsPath,
  latestVersion,
  nextVersion,
} from "#lib/docs";
import type { DocsNavigationPage, DocsPage as DocsPageData } from "#lib/docs";
import { getAbsoluteUrl } from "#lib/site";
import { getPageUrl, getWebSiteId, organizationId } from "#lib/structured-data";

interface NavigationItem {
  readonly children: NavigationItem[];
  readonly page: DocsNavigationPage;
}

/** The pages as a tree: a directory's pages under its `index.md`. */
const toNavigation = (pages: readonly DocsNavigationPage[]) => {
  const items = new Map<string, NavigationItem>();
  const roots: NavigationItem[] = [];

  // A directory's page sorts before the pages inside it.
  for (const page of pages) {
    const item = { children: [], page };
    items.set(page.slug.join("/"), item);

    const parent =
      page.slug.length > 1 && items.get(page.slug.slice(0, -1).join("/"));

    (parent ? parent.children : roots).push(item);
  }

  return roots;
};

interface NavigationListProps {
  readonly current: DocsPageData;
  /** The pages whose children are listed: the current one and those above. */
  readonly expanded: ReadonlySet<string>;
  readonly items: readonly NavigationItem[];
  readonly version: string;
}

const NavigationList = ({
  current,
  expanded,
  items,
  version,
}: NavigationListProps) => (
  <ul className="in-[li]:border-border space-y-1 in-[li]:mt-1 in-[li]:ml-3 in-[li]:border-l in-[li]:pl-3">
    {items.map(({ children, page }) => (
      <li key={page.path}>
        <Link
          aria-current={page.path === current.path ? "page" : undefined}
          className="text-muted-foreground hover:text-foreground aria-[current=page]:text-primary block py-1 text-sm aria-[current=page]:font-medium"
          href={getDocsPath(version, page.slug)}
          lang={page.language}
          prefetch
        >
          {page.title}
        </Link>
        {children.length > 0 && expanded.has(page.path) ? (
          <NavigationList
            current={current}
            expanded={expanded}
            items={children}
            version={version}
          />
        ) : null}
      </li>
    ))}
  </ul>
);

interface VersionMenuProps {
  readonly current: string;
  readonly label: string;
  readonly slug: readonly string[];
  readonly versions: readonly { hasPage: boolean; name: string }[];
}

/** Every version, each leading to this page, or to its root without one. */
const VersionMenu = ({ current, label, slug, versions }: VersionMenuProps) => (
  <Menu
    align="left"
    label={`${label}: ${current}`}
    summary={<span className="font-mono">{current}</span>}
    summaryClassName="border-border text-foreground hover:bg-accent w-fit rounded-md border px-3 py-1.5"
  >
    {versions.map(({ hasPage, name }) => (
      <li key={name}>
        <Link
          aria-current={name === current ? "page" : undefined}
          className="hover:bg-accent text-foreground aria-[current=page]:text-primary block px-4 py-2 font-mono aria-[current=page]:font-medium"
          href={getDocsPath(name, hasPage ? slug : [])}
        >
          {name}
        </Link>
      </li>
    ))}
  </Menu>
);

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

interface DocsPageProps {
  /** The locale the page is written in: the source locale's until translated. */
  readonly language: Locale;
  readonly page: DocsPageData;
  /**
   * The version the URL names: `latest` for the newest release reached
   * without one, whose links to its pages then name no version either.
   */
  readonly version: string;
}

export const DocsPage = async ({
  language,
  page,
  version: linkVersion,
}: DocsPageProps) => {
  const [locale, t, latest, versions] = await Promise.all([
    getRootLocale(),
    getTranslations(),
    getCurrentVersion(),
    getDocsVersions(),
  ]);

  const version = linkVersion === latestVersion ? latest : linkVersion;

  const [pageLocales, pages] = await Promise.all([
    Promise.all(
      versions.map(async ({ name }) => ({
        locales: await getDocsPageLocales(name, page.slug),
        name,
      }))
    ),
    getDocsNavigation(version, locale),
  ]);

  // A version has the page when the source locale does, which a locale
  // without it falls back to.
  const versionsWithPage = pageLocales.map(({ locales, name }) => ({
    hasPage: locales.includes(locale) || locales.includes(docsSourceLocale),
    name,
  }));

  const locales =
    pageLocales.find(({ name }) => name === version)?.locales ?? [];

  // Every locale serves the source locale's pages.
  const servedLocales = locales.includes(docsSourceLocale)
    ? undefined
    : locales;

  const translated = language === locale;

  // The newest release with the page in the reader's locale, or `next`.
  const translatedVersions = pageLocales.flatMap((pageLocale) =>
    pageLocale.locales.includes(locale) ? [pageLocale.name] : []
  );

  const translatedVersion =
    translatedVersions.find((name) => name !== nextVersion) ??
    translatedVersions[0];

  // `next` mirrors the source tree in every translated locale, so a page it
  // has only in the source locale is in a locale yet to be translated.
  const translationPlanned =
    pageLocales
      .find(({ name }) => name === nextVersion)
      ?.locales.includes(docsSourceLocale) ?? false;

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
      <SiteHeader locales={servedLocales} section="docs" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <aside className="border-border border-b py-8 lg:border-b-0 lg:py-20">
          <VersionMenu
            current={version}
            label={t("docs.versionLabel")}
            slug={page.slug}
            versions={versionsWithPage}
          />
          <DocsNavigation
            label={t("docs.navigationLabel")}
            summary={
              <span lang={translated ? undefined : language}>{page.title}</span>
            }
          >
            <NavigationList
              current={page}
              expanded={
                new Set([...ancestors, page].map((crumb) => crumb.path))
              }
              items={toNavigation(pages)}
              version={linkVersion}
            />
          </DocsNavigation>
        </aside>
        <main className="max-w-3xl py-12 sm:py-16 lg:py-20">
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
        </main>
      </div>
      <SiteFooter />
    </>
  );
};
