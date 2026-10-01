import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

import { JsonLd } from "#components/json-ld";
import { routing } from "#i18n/routing";
import { getAbsoluteUrl, productionUrl } from "#lib/site";
import {
  getPageUrl,
  getWebSiteId,
  organizationGitHubUrl,
  organizationId,
} from "#lib/structured-data";

import "../globals.css";

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations();

  return {
    description: t("metadata.description"),
    // Next.js falls back to Vercel's URLs for social images alone, and leaves
    // the canonical and `hreflang` URLs relative without a base. Every
    // deployment points them at production, so a preview is not indexed as
    // the site.
    metadataBase: productionUrl,
    title: {
      default: t("metadata.title", { name: t("site.name") }),
      template: `%s — ${t("site.name")}`,
    },
    twitter: { card: "summary_large_image" },
  };
};

const RootLayout = async ({ children }: LayoutProps<"/[locale]">) => {
  const [locale, t] = await Promise.all([getLocale(), getTranslations()]);
  const homeUrl = getPageUrl("/", locale);

  return (
    // While a dialog is open the page holds still, so restoring focus on
    // close does not scroll the reader somewhere else.
    <html
      className="scroll-pt-20 scroll-smooth scheme-light has-[dialog[open]]:overflow-hidden"
      data-scroll-behavior="smooth"
      lang={locale}
    >
      <body className="bg-background text-foreground antialiased">
        <JsonLd
          graph={[
            {
              "@id": organizationId,
              "@type": "Organization",
              description: t("footer.about"),
              // Google wants a logo of at least 112px, which `/icon` is not.
              logo: getAbsoluteUrl("/apple-icon"),
              name: t("site.organization"),
              sameAs: [organizationGitHubUrl],
              url: homeUrl,
            },
            {
              "@id": getWebSiteId(locale),
              "@type": "WebSite",
              description: t("metadata.description"),
              inLanguage: locale,
              name: t("site.name"),
              publisher: { "@id": organizationId },
              url: homeUrl,
            },
          ]}
        />
        {/* Client Components get the locale, for `Link` and `useLocale`, but
            not the catalog: `null` keeps the messages out of the page. */}
        <NextIntlClientProvider messages={null}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
