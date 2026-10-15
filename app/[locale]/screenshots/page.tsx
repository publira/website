import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "#components/json-ld";
import { ScreenGroups } from "#components/screen-groups";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { getRootLocale } from "#i18n/locale";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import type { Page } from "#lib/site";
import { getPageUrl } from "#lib/structured-data";

const page: Page = "/screenshots";

export const generateMetadata = async (): Promise<Metadata> => {
  const [locale, t] = await Promise.all([getRootLocale(), getTranslations()]);
  const title = t("screens.metadata.title");

  return {
    alternates: getAlternates(page, locale),
    description: t("screens.metadata.description"),
    openGraph: getOpenGraph(page, locale, {
      siteName: t("site.name"),
      title,
    }),
    title,
  };
};

const Screenshots = async () => {
  const [locale, t] = await Promise.all([getRootLocale(), getTranslations()]);

  return (
    <>
      <JsonLd
        graph={[
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { item: getPageUrl("/", locale), name: t("site.name") },
              {
                item: getPageUrl(page, locale),
                name: t("screens.metadata.title"),
              },
            ].map((crumb, index) => ({
              ...crumb,
              "@type": "ListItem",
              position: index + 1,
            })),
          },
        ]}
      />
      <SiteHeader section="screenshots" />
      <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h1 className="font-display text-foreground break-phrase max-w-3xl text-4xl text-balance sm:text-5xl">
          {t("screens.title")}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          {t("screens.lead")}
        </p>
        <div className="mt-16">
          <ScreenGroups />
        </div>
      </main>
      <SiteFooter note={t("footer.seedData")} />
    </>
  );
};

export default Screenshots;
