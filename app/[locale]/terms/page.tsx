import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { DocumentPage } from "#components/document-page";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import { loadDocument } from "#lib/documents";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  const [{ frontmatter }, t] = await Promise.all([
    loadDocument("terms", locale),
    getTranslations(),
  ]);

  return {
    alternates: getAlternates("/terms", locale),
    description: frontmatter.description,
    openGraph: getOpenGraph("/terms", locale, {
      siteName: t("site.name"),
      title: frontmatter.title,
    }),
    title: frontmatter.title,
  };
};

const Terms = () => <DocumentPage name="terms" />;

export default Terms;
