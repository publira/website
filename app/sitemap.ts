import type { MetadataRoute } from "next";

import { getAlternates } from "#i18n/metadata";
import { routing } from "#i18n/routing";
import { getCurrentVersion, getDocsPath, getDocsTree } from "#lib/docs";
import { getAbsoluteUrl, pages } from "#lib/site";

// The documentation lists only the newest version, which every other version
// names as its canonical page.
const getDocsEntries = async (): Promise<MetadataRoute.Sitemap> => {
  const version = await getCurrentVersion();
  const tree = await getDocsTree(version);

  return (tree?.pages ?? []).map(({ published, slug, updated }) => ({
    lastModified: updated ?? published,
    url: getAbsoluteUrl(getDocsPath(version, slug)),
  }));
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => [
  ...pages.flatMap((page) =>
    routing.locales.map((locale) => {
      const { canonical, languages } = getAlternates(page, locale);

      return {
        alternates: {
          languages: Object.fromEntries(
            Object.entries(languages).map(([language, path]) => [
              language,
              getAbsoluteUrl(path),
            ])
          ),
        },
        url: getAbsoluteUrl(canonical),
      };
    })
  ),
  ...(await getDocsEntries()),
];

export default sitemap;
