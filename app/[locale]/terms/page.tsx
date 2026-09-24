import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { DocumentPage } from "#components/document-page";
import { getAlternates } from "#i18n/navigation";
import { loadDocument } from "#lib/documents";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  const { frontmatter } = await loadDocument("terms", locale);

  return {
    alternates: getAlternates("/terms", locale),
    description: frontmatter.description,
    title: frontmatter.title,
  };
};

const Terms = () => <DocumentPage name="terms" />;

export default Terms;
