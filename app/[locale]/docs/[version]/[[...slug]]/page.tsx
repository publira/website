import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { DocsPage } from "#components/docs-page";
import { getRootLocale } from "#i18n/locale";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import { getPathname } from "#i18n/navigation";
import {
  docsSourceLocale,
  findPage,
  getCurrentVersion,
  getDocsPageLocales,
  getDocsPageParams,
  getDocsPath,
  getDocsTree,
  getDocsVersions,
  getLocalizedDocsPath,
} from "#lib/docs";

type Props = PageProps<"/[locale]/docs/[version]/[[...slug]]">;

// A page that does not exist answers 404, and a version's root a redirect, so
// the params are read before the response starts rather than behind a
// fallback. The sidebar prefetches each page in full instead.
export const instant = false;

// Each version's root is given in every locale, which Cache Components wants
// a param for, and redirects where the locale has no tree.
export const generateStaticParams = async () => {
  const [versions, pages] = await Promise.all([
    getDocsVersions(),
    getDocsPageParams(await getRootLocale()),
  ]);
  return [
    ...versions.map(({ name }) => ({ slug: [], version: name })),
    ...pages,
  ];
};

const loadPage = async (params: Props["params"]) => {
  const [{ slug = [], version }, locale] = await Promise.all([
    params,
    getRootLocale(),
  ]);
  const tree = await getDocsTree(version, locale);
  return { locale, page: tree && findPage(tree, slug), slug, tree, version };
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const [{ locale, page, slug, version }, latest, t] = await Promise.all([
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
  const [latestTree, locales] = await Promise.all([
    version === latest ? null : getDocsTree(latest, locale),
    getDocsPageLocales(version, slug),
  ]);
  const canonical =
    latestTree && findPage(latestTree, slug) ? getDocsPath(latest, slug) : path;

  return {
    alternates: {
      canonical: getPathname({ href: canonical, locale }),
      languages: getAlternates(path, locale, locales).languages,
    },
    description: page.description,
    openGraph: {
      ...getOpenGraph(path, locale, {
        image: getDocsPath(version, ["opengraph-image", ...slug]),
        locales,
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
  const { locale, page, slug, tree, version } = await loadPage(params);
  if (page && tree) {
    return <DocsPage page={page} tree={tree} version={version} />;
  }

  // A version without a root `index.md` opens at its first page.
  const [first] = tree?.pages ?? [];
  if (slug.length === 0 && first) {
    redirect(getLocalizedDocsPath(locale, version, first.slug));
  }
  // A page the locale has no translation of, at this version or at all, is
  // read in the source locale until it has one.
  if (locale !== docsSourceLocale) {
    const source = await getDocsTree(version, docsSourceLocale);
    if (source && (slug.length === 0 || findPage(source, slug))) {
      redirect(getLocalizedDocsPath(docsSourceLocale, version, slug));
    }
  }
  notFound();
};

export default Docs;
