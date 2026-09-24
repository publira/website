import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { createNavigation } from "next-intl/navigation";

import { routing } from "#i18n/routing";

export const { getPathname, Link, usePathname } = createNavigation(routing);

/** The canonical URL of a page and the `hreflang` alternates of every locale. */
export const getAlternates = (
  href: string,
  locale: Locale
): Metadata["alternates"] => ({
  canonical: getPathname({ href, locale }),
  languages: {
    ...Object.fromEntries(
      routing.locales.map((alternate) => [
        alternate,
        getPathname({ href, locale: alternate }),
      ])
    ),
    // A reader whose language the site does not have gets the default locale.
    "x-default": getPathname({ href, locale: routing.defaultLocale }),
  },
});
