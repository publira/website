import {
  getTranslator,
  renderOpenGraphImage,
  toLocale,
} from "#components/open-graph-image";
import { routing } from "#i18n/routing";

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

const image = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale: requested } = await params;
  const locale = toLocale(requested);
  const t = await getTranslator(locale);
  return renderOpenGraphImage(locale, t("screens.metadata.title"));
};

export default image;
