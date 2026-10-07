import { renderOpenGraphImage } from "#components/open-graph-image";
import {
  docsLocale,
  findPage,
  getDocsPageParams,
  getDocsTree,
} from "#lib/docs";

// The proxy redirects other locales' docs to English.
export const generateStaticParams = async () => {
  const pages = await getDocsPageParams();
  return pages.map((params) => ({ ...params, locale: docsLocale }));
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
  const tree = locale === docsLocale ? await getDocsTree(version) : null;
  const page = tree && findPage(tree, slug);
  if (!page) {
    return new Response(null, { status: 404 });
  }
  return renderOpenGraphImage(docsLocale, page.title);
};

export { renderCard as GET };
