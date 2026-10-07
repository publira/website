import { getAlternates } from "#i18n/metadata";
import { routing } from "#i18n/routing";
import { getCurrentVersion, getDocsPath, getDocsTree } from "#lib/docs";
import { getAbsoluteUrl, pages } from "#lib/site";

// The sitemap, which `next.config.ts` serves at `/sitemap.xml`. On Vercel,
// Next.js 16.3 turns any prerendered route at `sitemap.xml` into a static file
// that `revalidateTag` never reaches (vercel/next.js#99055), so the sitemap
// would keep the documentation of the last deployment. At another path, the
// route stays a prerender tagged like the documentation it reads. Once a
// release carries vercel/next.js#99056, this goes back to `app/sitemap.ts`.

interface SitemapEntry {
  /** Every locale's URL of the page, and `x-default`, by `hreflang`. */
  readonly alternates?: Readonly<Record<string, string>>;
  /** `YYYY-MM-DD`. */
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

const getPageEntries = (): SitemapEntry[] =>
  pages.flatMap((page) =>
    routing.locales.map((locale) => {
      const { canonical, languages } = getAlternates(page, locale);

      return {
        alternates: Object.fromEntries(
          Object.entries(languages).map(([language, path]) => [
            language,
            getAbsoluteUrl(path),
          ])
        ),
        url: getAbsoluteUrl(canonical),
      };
    })
  );

// The documentation lists only the newest version, which every other version
// names as its canonical page.
const getDocsEntries = async (): Promise<SitemapEntry[]> => {
  const version = await getCurrentVersion();
  const tree = await getDocsTree(version);

  return (tree?.pages ?? []).map(({ published, slug, updated }) => ({
    lastModified: updated ?? published,
    url: getAbsoluteUrl(getDocsPath(version, slug)),
  }));
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
