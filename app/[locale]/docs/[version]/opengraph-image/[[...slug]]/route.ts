import { hasLocale } from "next-intl";

import { renderOpenGraphImage } from "#components/open-graph-image";
import { routing } from "#i18n/routing";
import { findPage, getDocsPageParams, getDocsTree } from "#lib/docs";

// The cards of the pages each locale has. Cache Components wants at least one
// param, which the source locale's pages give.
export const generateStaticParams = async () => {
  const pages = await Promise.all(
    routing.locales.map(async (locale) => {
      const params = await getDocsPageParams(locale);
      return params.map((page) => ({ ...page, locale }));
    })
  );
  return pages.flat();
};

// The card of a docs page. A metadata image cannot sit below the pages'
// catch-all segment, so it is a Route Handler of its own.
const renderCard = async (
  _request: Request,
  {
    params,
  }: RouteContext<"/[locale]/docs/[version]/opengraph-image/[[...slug]]">
) => {
  const { locale, slug = [], version } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return new Response(null, { status: 404 });
  }
  const tree = await getDocsTree(version, locale);
  const page = tree && findPage(tree, slug);
  if (!page) {
    return new Response(null, { status: 404 });
  }
  return renderOpenGraphImage(locale, page.title);
};

export { renderCard as GET };
