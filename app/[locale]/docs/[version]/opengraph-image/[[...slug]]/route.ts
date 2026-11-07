import { hasLocale } from "next-intl";

import { renderOpenGraphImage } from "#components/open-graph-image";
import { routing } from "#i18n/routing";
import { getDocsPage } from "#lib/docs";

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

  const found = await getDocsPage(version, locale, slug);

  if (!found) {
    return new Response(null, { status: 404 });
  }

  return renderOpenGraphImage(locale, found.page.title);
};

export { renderCard as GET };
