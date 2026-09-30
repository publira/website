import type { Locale } from "next-intl";

import {
  getTranslator,
  renderOpenGraphImage,
  toLocale,
} from "#components/open-graph-image";
import { routing } from "#i18n/routing";

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

const getTitle = async (locale: Locale) => {
  const t = await getTranslator(locale);
  return t("metadata.title", { name: t("site.name") });
};

const image = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale: requested } = await params;
  const locale = toLocale(requested);
  return renderOpenGraphImage(locale, await getTitle(locale));
};

export default image;
