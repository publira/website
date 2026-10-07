import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { DocsContent } from "#components/docs-content";
import { JsonLd } from "#components/json-ld";
import { Menu } from "#components/menu";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { Link } from "#i18n/navigation";
import {
  docsLocale,
  findPage,
  getCurrentVersion,
  getDocsPath,
  getDocsTree,
  getDocsVersions,
  nextVersion,
} from "#lib/docs";
import type { DocsPage as DocsPageData, DocsTree } from "#lib/docs";
import { getAbsoluteUrl } from "#lib/site";
import { getPageUrl, getWebSiteId, organizationId } from "#lib/structured-data";

interface NavigationItem {
  readonly children: NavigationItem[];
  readonly page: DocsPageData;
}

/** The pages as a tree: a directory's pages under its `index.md`. */
const toNavigation = (pages: readonly DocsPageData[]) => {
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
  readonly items: readonly NavigationItem[];
  readonly version: string;
}

const NavigationList = ({ current, items, version }: NavigationListProps) => (
  <ul className="in-[li]:border-border space-y-1 in-[li]:mt-1 in-[li]:ml-3 in-[li]:border-l in-[li]:pl-3">
    {items.map(({ children, page }) => (
      <li key={page.path}>
        <Link
          aria-current={page.path === current.path ? "page" : undefined}
          className="text-muted-foreground hover:text-foreground aria-[current=page]:text-primary block py-1 text-sm aria-[current=page]:font-medium"
          href={getDocsPath(version, page.slug)}
          prefetch
        >
          {page.title}
        </Link>
        {children.length > 0 ? (
          <NavigationList
            current={current}
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
  readonly versions: readonly { name: string; tree: DocsTree | null }[];
}

/** Every version, each leading to this page, or to its root without one. */
const VersionMenu = ({ current, label, slug, versions }: VersionMenuProps) => (
  <Menu
    align="left"
    label={`${label}: ${current}`}
    summary={<span className="font-mono">{current}</span>}
    summaryClassName="border-border text-foreground hover:bg-accent w-fit rounded-md border px-3 py-1.5"
  >
    {versions.map(({ name, tree }) => (
      <li key={name}>
        <Link
          aria-current={name === current ? "page" : undefined}
          className="hover:bg-accent text-foreground aria-[current=page]:text-primary block px-4 py-2 font-mono aria-[current=page]:font-medium"
          href={getDocsPath(name, tree && findPage(tree, slug) ? slug : [])}
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
    <p className="border-border mb-8 rounded-md border px-4 py-3 text-sm leading-relaxed">
      {t.rich(version === nextVersion ? "nextNotice" : "olderNotice", {
        code,
        latest,
        link,
        version,
      })}
    </p>
  );
};

interface AdjacentPageLinkProps {
  readonly label: string;
  readonly page: DocsPageData;
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
    <span className="text-foreground mt-1 block font-medium">{page.title}</span>
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
  readonly page: DocsPageData;
  readonly tree: DocsTree;
  readonly version: string;
}

export const DocsPage = async ({ page, tree, version }: DocsPageProps) => {
  const [t, latest, versions] = await Promise.all([
    getTranslations(),
    getCurrentVersion(),
    getDocsVersions(),
  ]);
  const trees = await Promise.all(
    versions.map(async ({ name }) => ({
      name,
      tree: name === version ? tree : await getDocsTree(name),
    }))
  );
  const url = getAbsoluteUrl(getDocsPath(version, page.slug));
  // The directories' pages above this one.
  const ancestors = page.slug.flatMap((_, index) => {
    const ancestor =
      index < page.slug.length - 1 &&
      findPage(tree, page.slug.slice(0, index + 1));
    return ancestor ? [ancestor] : [];
  });
  const position = tree.pages.findIndex(({ path }) => path === page.path);
  const previous = tree.pages[position - 1];
  const next = tree.pages[position + 1];

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
            inLanguage: docsLocale,
            isPartOf: { "@id": getWebSiteId(docsLocale) },
            publisher: { "@id": organizationId },
            url,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { item: getPageUrl("/", docsLocale), name: t("site.name") },
              ...[...ancestors, page].map((crumb) => ({
                item: getAbsoluteUrl(getDocsPath(version, crumb.slug)),
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
      <SiteHeader localeHref="/" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <aside className="border-border border-b py-8 lg:border-b-0 lg:py-20">
          <VersionMenu
            current={version}
            label={t("docs.versionLabel")}
            slug={page.slug}
            versions={trees}
          />
          <nav aria-label={t("docs.navigationLabel")} className="mt-6">
            <NavigationList
              current={page}
              items={toNavigation(tree.pages)}
              version={version}
            />
          </nav>
        </aside>
        <main className="max-w-3xl py-12 sm:py-16 lg:py-20">
          {version === latest ? null : (
            <VersionNotice latest={latest} version={version} />
          )}
          <article className="text-muted-foreground">
            <h1 className="font-display text-foreground text-3xl text-balance sm:text-4xl">
              {page.title}
            </h1>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <PageDate date={page.published} kind="published" />
              {page.updated ? (
                <PageDate date={page.updated} kind="updated" />
              ) : null}
            </p>
            <DocsContent slug={page.slug} version={version} />
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
                  version={version}
                />
              ) : null}
              {next ? (
                <AdjacentPageLink
                  label={t("docs.nextPage")}
                  page={next}
                  rel="next"
                  version={version}
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
