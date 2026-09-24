import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

import { routing } from "#i18n/routing";

import "../globals.css";

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

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
    metadataBase: productionUrl ? new URL(`https://${productionUrl}`) : null,
    title: t("metadata.title", { name: t("site.name") }),
  };
};

const RootLayout = async ({ children }: LayoutProps<"/[locale]">) => {
  const locale = await getLocale();

  return (
    // While a dialog is open the page holds still, so restoring focus on
    // close does not scroll the reader somewhere else.
    <html
      className="scroll-pt-20 scroll-smooth scheme-light has-[dialog[open]]:overflow-hidden"
      data-scroll-behavior="smooth"
      lang={locale}
    >
      <body className="bg-background text-foreground antialiased">
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
