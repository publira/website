import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { DocsPage } from "#components/docs-page";
import { getOpenGraph } from "#i18n/metadata";
import {
  docsLocale,
  findPage,
  getCurrentVersion,
  getDocsPageParams,
  getDocsPath,
  getDocsTree,
  getDocsVersions,
  nextVersion,
} from "#lib/docs";

type Props = PageProps<"/[locale]/docs/[version]/[[...slug]]">;

// A page that does not exist answers 404, and a version's root a redirect, so
// the params are read before the response starts rather than behind a
// fallback. The sidebar prefetches each page in full instead.
export const instant = false;

export const generateStaticParams = async ({
  params,
}: {
  params: { locale: string };
}) => {
  // Another locale's docs URL redirects to English in the proxy, but
  // Cache Components wants a param for every locale all the same, and gets
  // one that renders as not found.
  if (params.locale !== docsLocale) {
    return [{ slug: [], version: nextVersion }];
  }

  // A version's root is listed for its redirect, whether or not it has a page.
  const [versions, pages] = await Promise.all([
    getDocsVersions(),
    getDocsPageParams(),
  ]);
  return [
    ...versions.map(({ name }) => ({ slug: [], version: name })),
    ...pages,
  ];
};

const loadPage = async (params: Props["params"]) => {
  const { locale, slug = [], version } = await params;
  const tree = locale === docsLocale ? await getDocsTree(version) : null;
  if (!tree) {
    notFound();
  }
  return { page: findPage(tree, slug), slug, tree, version };
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const [{ page, slug, version }, latest, t] = await Promise.all([
    loadPage(params),
    getCurrentVersion(),
    getTranslations(),
  ]);
  if (!page) {
    return {};
  }

  const path = getDocsPath(version, slug);
  // Every version but the newest is left out of search, and points at the
  // same page in the newest version when it has one.
  const latestTree = version === latest ? null : await getDocsTree(latest);
  const canonical =
    latestTree && findPage(latestTree, slug) ? getDocsPath(latest, slug) : path;

  return {
    alternates: { canonical },
    description: page.description,
    openGraph: {
      ...getOpenGraph(path, docsLocale, {
        image: getDocsPath(version, ["opengraph-image", ...slug]),
        locales: [docsLocale],
        siteName: t("site.name"),
        title: page.title,
      }),
      modifiedTime: page.updated,
      publishedTime: page.published,
      type: "article",
    },
    robots: version === latest ? undefined : { index: false },
    title: page.title,
  };
};

const Docs = async ({ params }: Props) => {
  const { page, slug, tree, version } = await loadPage(params);
  if (!page) {
    // A version without a root `index.md` opens at its first page.
    const [first] = tree.pages;
    if (slug.length === 0 && first) {
      redirect(getDocsPath(version, first.slug));
    }
    notFound();
  }

  return <DocsPage page={page} tree={tree} version={version} />;
};

export default Docs;
