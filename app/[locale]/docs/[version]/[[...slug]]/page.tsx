import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, permanentRedirect, redirect } from "next/navigation";

import { DocsPage } from "#components/docs-page";
import { getRootLocale } from "#i18n/locale";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import { getPathname } from "#i18n/navigation";
import {
  findPage,
  getCurrentVersion,
  getDocsNavigation,
  getDocsPage,
  getDocsPageLocales,
  getDocsPageParams,
  getDocsPath,
  getDocsRedirect,
  getDocsTree,
  getDocsVersions,
  getLocalizedDocsPath,
  latestVersion,
  nextVersion,
} from "#lib/docs";

type Props = PageProps<"/[locale]/docs/[version]/[[...slug]]">;

// A page that does not exist answers 404, and a version's root a redirect, so
// the params are read before the response starts rather than behind a
// fallback. The sidebar prefetches each page in full instead.
export const instant = false;

// Every locale serves the source locale's pages, translated or not. Each
// version's root is given too, which redirects without an `index.md`, and the
// newest release's pages again as `latest`.
export const generateStaticParams = async () => {
  const [versions, pages, current] = await Promise.all([
    getDocsVersions(),
    getDocsPageParams(await getRootLocale()),
    getCurrentVersion(),
  ]);

  return [
    ...[...versions.map(({ name }) => name), latestVersion].map((version) => ({
      slug: [],
      version,
    })),
    ...pages,
    ...pages.flatMap(({ slug, version }) =>
      version === current ? [{ slug, version: latestVersion }] : []
    ),
  ];
};

const loadPage = async (params: Props["params"]) => {
  const [{ slug = [], version: segment }, locale] = await Promise.all([
    params,
    getRootLocale(),
  ]);

  // `latest` renders as the newest release's page, so the canonical link and
  // the links inside it name that release.
  const version =
    segment === latestVersion ? await getCurrentVersion() : segment;

  return {
    found: await getDocsPage(version, locale, slug),
    locale,
    segment,
    slug,
    version,
  };
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const [{ found, locale, slug, version }, latest, t] = await Promise.all([
    loadPage(params),
    getCurrentVersion(),
    getTranslations(),
  ]);

  if (!found) {
    return {};
  }

  const { language, page } = found;
  const path = getDocsPath(version, slug);

  // `next` is left out of search, and points at the same page in the newest
  // release when it has one. An untranslated page points at the source
  // locale's, which alone is indexed.
  const indexed = version !== nextVersion;

  const [latestTree, locales] = await Promise.all([
    indexed ? null : getDocsTree(latest, language),
    getDocsPageLocales(version, slug),
  ]);

  const canonical =
    latestTree && findPage(latestTree, slug) ? getDocsPath(latest, slug) : path;

  return {
    alternates: {
      canonical: getPathname({ href: canonical, locale: language }),
      languages: getAlternates(path, locale, locales).languages,
    },
    description: page.description,
    openGraph: {
      ...getOpenGraph(path, locale, {
        image: getDocsPath(version, ["opengraph-image", ...slug]),
        language,
        locales,
        siteName: t("site.name"),
        title: page.title,
      }),
      modifiedTime: page.updated,
      publishedTime: page.published,
      type: "article",
    },
    robots: indexed ? undefined : { index: false },
    title: page.title,
  };
};

const Docs = async ({ params }: Props) => {
  const { found, locale, segment, slug, version } = await loadPage(params);

  if (found) {
    return (
      <DocsPage language={found.language} page={found.page} version={segment} />
    );
  }

  // A page renamed or moved lists its former URL in `redirect_from`, which
  // keeps leading to it in every version whose tree says so. A URL without a
  // version leads to one without a version, so it never pins a release.
  const target =
    slug.length > 0 ? await getDocsRedirect(version, locale, slug) : null;

  if (target) {
    permanentRedirect(getLocalizedDocsPath(locale, segment, target));
  }

  // A version without a root `index.md` opens at its first page.
  const [first] =
    slug.length === 0 ? await getDocsNavigation(version, locale) : [];

  if (first) {
    redirect(getLocalizedDocsPath(locale, segment, first.slug));
  }

  notFound();
};

export default Docs;
