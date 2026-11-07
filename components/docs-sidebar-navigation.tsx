"use client";

import type { Locale } from "next-intl";

import { DocsNavigation } from "#components/docs-navigation";
import { Menu } from "#components/menu";
import { Link, usePathname } from "#i18n/navigation";
import { docsVersionsPath, getDocsPath } from "#lib/docs-path";

export interface SidebarPage {
  /** The source locale, on a page the locale has no translation of. */
  readonly language?: Locale;
  readonly path: string;
  readonly slug: readonly string[];
  readonly title: string;
}

interface NavigationItem {
  readonly children: NavigationItem[];
  readonly page: SidebarPage;
}

/** The pages as a tree: a directory's pages under its `index.md`. */
const toNavigation = (pages: readonly SidebarPage[]) => {
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
  readonly current: string;
  readonly items: readonly NavigationItem[];
  readonly version: string;
}

/** The list, with the current page and the directories above it open. */
const NavigationList = ({ current, items, version }: NavigationListProps) => (
  <ul className="in-[li]:border-border space-y-1 in-[li]:mt-1 in-[li]:ml-3 in-[li]:border-l in-[li]:pl-3">
    {items.map(({ children, page }) => {
      const key = page.slug.join("/");

      return (
        <li key={page.path}>
          <Link
            aria-current={key === current ? "page" : undefined}
            className="text-muted-foreground hover:text-foreground aria-[current=page]:text-primary block py-1 text-sm aria-[current=page]:font-medium"
            href={getDocsPath(version, page.slug)}
            lang={page.language}
            prefetch
          >
            {page.title}
          </Link>
          {children.length > 0 &&
          (current === key || current.startsWith(`${key}/`)) ? (
            <NavigationList
              current={current}
              items={children}
              version={version}
            />
          ) : null}
        </li>
      );
    })}
  </ul>
);

interface DocsSidebarNavigationProps {
  readonly allVersionsLabel: string;
  readonly navigationLabel: string;
  readonly pages: readonly SidebarPage[];
  /** The version the URL names: `latest` for the newest release. */
  readonly segment: string;
  /** The version served, which the menu names. */
  readonly version: string;
  readonly versionLabel: string;
  /** The menu's versions, each with the slugs of the pages it serves. */
  readonly versions: readonly { name: string; slugs: readonly string[] }[];
}

/**
 * The version menu and the version's pages. The layout keeps them across the
 * version's pages, so the current page is read from the URL.
 */
export const DocsSidebarNavigation = ({
  allVersionsLabel,
  navigationLabel,
  pages,
  segment,
  version,
  versionLabel,
  versions,
}: DocsSidebarNavigationProps) => {
  const base = getDocsPath(segment);
  const pathname = usePathname();

  const current =
    pathname === base || pathname.startsWith(`${base}/`)
      ? pathname.slice(base.length + 1)
      : "";

  const currentPage = pages.find(({ slug }) => slug.join("/") === current);

  return (
    <>
      <Menu
        align="left"
        label={`${versionLabel}: ${version}`}
        summary={<span className="font-mono">{version}</span>}
        summaryClassName="border-border text-foreground hover:bg-accent w-fit rounded-md border px-3 py-1.5"
      >
        {versions.map(({ name, slugs }) => (
          <li key={name}>
            {/* A version without this page opens at its root. */}
            <Link
              aria-current={name === version ? "page" : undefined}
              className="hover:bg-accent text-foreground aria-[current=page]:text-primary block px-4 py-2 font-mono aria-[current=page]:font-medium"
              href={
                slugs.includes(current)
                  ? getDocsPath(name, current.split("/"))
                  : getDocsPath(name)
              }
            >
              {name}
            </Link>
          </li>
        ))}
        <li className="border-border mt-1 border-t pt-1">
          <Link
            className="hover:bg-accent text-foreground block px-4 py-2"
            href={docsVersionsPath}
          >
            {allVersionsLabel}
          </Link>
        </li>
      </Menu>
      <DocsNavigation
        label={navigationLabel}
        summary={
          <span lang={currentPage?.language}>
            {currentPage?.title ?? navigationLabel}
          </span>
        }
      >
        <NavigationList
          current={current}
          items={toNavigation(pages)}
          version={segment}
        />
      </DocsNavigation>
    </>
  );
};
