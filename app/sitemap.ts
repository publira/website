import type { MetadataRoute } from "next";

import { getAlternates } from "#i18n/metadata";
import { routing } from "#i18n/routing";
import { getAbsoluteUrl, pages } from "#lib/site";

const sitemap = (): MetadataRoute.Sitemap =>
  pages.flatMap((page) =>
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
  );

export default sitemap;
