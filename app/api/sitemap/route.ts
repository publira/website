import type { Locale } from "next-intl";

import { getAlternates } from "#i18n/metadata";
import { routing } from "#i18n/routing";
import {
  getCurrentVersion,
  getDocsPath,
  getDocsTree,
  getDocsVersions,
  latestVersion,
  nextVersion,
} from "#lib/docs";
import { getAbsoluteUrl, pages } from "#lib/site";

// Served at `/sitemap.xml` through a rewrite, since a route at that path is
// never revalidated on Vercel (vercel/next.js#99055). Back to `app/sitemap.ts`
// once vercel/next.js#99056 is released.

interface SitemapEntry {
  readonly alternates?: Readonly<Record<string, string>>;
  readonly lastModified?: string;
  readonly url: string;
}

const xmlEntities = new Map([
  ['"', "&quot;"],
  ["&", "&amp;"],
  ["'", "&apos;"],
  ["<", "&lt;"],
  [">", "&gt;"],
]);

const escapeXml = (value: string) =>
  value.replaceAll(
    /["&'<>]/gu,
    (character) => xmlEntities.get(character) ?? ""
  );

const toAbsoluteAlternates = (languages: Readonly<Record<string, string>>) =>
  Object.fromEntries(
    Object.entries(languages).map(([language, path]) => [
      language,
      getAbsoluteUrl(path),
    ])
  );

const getPageEntries = (): SitemapEntry[] =>
  pages.flatMap((page) =>
    routing.locales.map((locale) => {
      const { canonical, languages } = getAlternates(page, locale);

      return {
        alternates: toAbsoluteAlternates(languages),
        url: getAbsoluteUrl(canonical),
      };
    })
  );

// Every release is listed in each locale that has the page, and the newest
// again at the URLs without a version. `next` is left out of search.
const getReleaseEntries = async (
  version: string,
  current: string
): Promise<SitemapEntry[]> => {
  const trees = await Promise.all(
    routing.locales.map(async (locale) => ({
      locale,
      tree: await getDocsTree(version, locale),
    }))
  );

  const pageLocales = new Map<string, Locale[]>();

  for (const { locale, tree } of trees) {
    for (const { slug } of tree?.pages ?? []) {
      const key = slug.join("/");
      pageLocales.set(key, [...(pageLocales.get(key) ?? []), locale]);
    }
  }

  const segments = version === current ? [latestVersion, version] : [version];

  return segments.flatMap((segment) =>
    trees.flatMap(({ locale, tree }) =>
      (tree?.pages ?? []).map(({ published, slug, updated }) => {
        const { canonical, languages } = getAlternates(
          getDocsPath(segment, slug),
          locale,
          pageLocales.get(slug.join("/"))
        );

        return {
          alternates: toAbsoluteAlternates(languages),
          lastModified: updated ?? published,
          url: getAbsoluteUrl(canonical),
        };
      })
    )
  );
};

const getDocsEntries = async () => {
  const [versions, current] = await Promise.all([
    getDocsVersions(),
    getCurrentVersion(),
  ]);

  const entries = await Promise.all(
    versions.flatMap(({ name }) =>
      name === nextVersion ? [] : [getReleaseEntries(name, current)]
    )
  );

  return entries.flat();
};

const toUrlElement = ({ alternates = {}, lastModified, url }: SitemapEntry) =>
  [
    "<url>",
    `<loc>${escapeXml(url)}</loc>`,
    ...Object.entries(alternates).map(
      ([language, href]) =>
        `<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(href)}" />`
    ),
    ...(lastModified ? [`<lastmod>${escapeXml(lastModified)}</lastmod>`] : []),
    "</url>",
  ].join("\n");

const serveSitemap = async () => {
  const entries = [...getPageEntries(), ...(await getDocsEntries())];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(toUrlElement),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: { "content-type": "application/xml" },
  });
};

export { serveSitemap as GET };
