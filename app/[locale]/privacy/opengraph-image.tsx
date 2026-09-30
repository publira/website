import { renderOpenGraphImage, toLocale } from "#components/open-graph-image";
import { routing } from "#i18n/routing";
import { loadDocument } from "#lib/documents";

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

const image = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale: requested } = await params;
  const locale = toLocale(requested);
  const { frontmatter } = await loadDocument("privacy", locale);
  return renderOpenGraphImage(locale, frontmatter.title);
};

export default image;
