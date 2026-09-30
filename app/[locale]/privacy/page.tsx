import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { DocumentPage } from "#components/document-page";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import { loadDocument } from "#lib/documents";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  const [{ frontmatter }, t] = await Promise.all([
    loadDocument("privacy", locale),
    getTranslations(),
  ]);

  return {
    alternates: getAlternates("/privacy", locale),
    description: frontmatter.description,
    openGraph: getOpenGraph("/privacy", locale, {
      siteName: t("site.name"),
      title: frontmatter.title,
    }),
    title: frontmatter.title,
  };
};

const Privacy = () => <DocumentPage name="privacy" />;

export default Privacy;
