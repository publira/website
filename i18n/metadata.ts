import { createHash } from "node:crypto";

import type { Metadata } from "next";
import type { Locale } from "next-intl";

import { openGraphImage } from "#components/open-graph-image";
import { getPathname } from "#i18n/navigation";
import { routing } from "#i18n/routing";

/**
 * The canonical URL of a page and the `hreflang` alternates of the locales it
 * is served in, every one unless named.
 */
export const getAlternates = (
  href: string,
  locale: Locale,
  locales: readonly Locale[] = routing.locales
) => ({
  canonical: getPathname({ href, locale }),
  languages: {
    ...Object.fromEntries(
      locales.map((alternate) => [
        alternate,
        getPathname({ href, locale: alternate }),
      ])
    ),
    // A reader whose language the site does not have gets the default locale.
    ...(locales.includes(routing.defaultLocale) && {
      "x-default": getPathname({ href, locale: routing.defaultLocale }),
    }),
  },
});

/** Open Graph writes a locale as a language and a territory: `ja_JP`. */
const toOpenGraphLocale = (locale: Locale) => {
  const { language, region } = new Intl.Locale(locale).maximize();
  return `${language}_${region}`;
};

// Crawlers keep a card by its URL, so the URL changes with the text it draws.
const getCardVersion = (siteName: string, title: string) =>
  createHash("sha256")
    .update(`${siteName}\n${title}`)
    .digest("hex")
    .slice(0, 16);

interface OpenGraphOptions {
  /** The card's path, when it is not `opengraph-image` beside the page. */
  readonly image?: string;
  /** The locales the page is served in, when it is not served in every one. */
  readonly locales?: readonly Locale[];
  readonly siteName: string;
  /** The page's title, which the card shows and its alt text repeats. */
  readonly title: string;
}

/**
 * The Open Graph fields of a page. A page's `openGraph` replaces its parent's
 * whole object, so every page builds its own from here.
 */
export const getOpenGraph = (
  href: string,
  locale: Locale,
  {
    image = `${href.replace(/\/$/u, "")}/opengraph-image`,
    locales = routing.locales,
    siteName,
    title,
  }: OpenGraphOptions
): Metadata["openGraph"] => ({
  alternateLocale: locales.flatMap((alternate) =>
    alternate === locale ? [] : [toOpenGraphLocale(alternate)]
  ),
  // Next.js would link the `opengraph-image` beside the page by its
  // `[locale]` path, which sends an English card through a redirect, give
  // every locale one alt text, and version the URL by the route file alone.
  images: {
    ...openGraphImage.size,
    alt: title,
    type: openGraphImage.contentType,
    url: `${getPathname({ href: image, locale })}?${new URLSearchParams({ v: getCardVersion(siteName, title) })}`,
  },
  locale: toOpenGraphLocale(locale),
  siteName,
  type: "website",
  url: getPathname({ href, locale }),
});
