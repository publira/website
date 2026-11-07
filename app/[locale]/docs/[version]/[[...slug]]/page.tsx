import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { DocsContent } from "#components/docs-content";
import {
  DocsAdjacentPages,
  DocsHeading,
  DocsNotices,
} from "#components/docs-page";
import {
  DocsBodyPlaceholder,
  DocsHeadingPlaceholder,
} from "#components/docs-placeholders";
import { getRootLocale } from "#i18n/locale";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import { getPathname } from "#i18n/navigation";
import {
  findPage,
  getCurrentVersion,
  getDocsPage,
  getDocsPageLocales,
  getDocsPath,
  getDocsTree,
  latestVersion,
  nextVersion,
} from "#lib/docs";

type Props = PageProps<"/[locale]/docs/[version]/[[...slug]]">;

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
  const { found, locale, slug, version } = await loadPage(params);

  if (!found) {
    return {};
  }

  const [latest, t] = await Promise.all([
    getCurrentVersion(),
    getTranslations(),
  ]);

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

// Each part reads what it shows, cached, behind a boundary of its own; the
// page itself reads nothing. The heading answers a URL without a page.
const Docs = ({ params }: Props) => {
  const part = params.then(({ slug = [], version }) => ({ slug, version }));

  return (
    <>
      <Suspense>
        {part.then((props) => (
          <DocsNotices {...props} />
        ))}
      </Suspense>
      <article className="text-muted-foreground">
        <Suspense fallback={<DocsHeadingPlaceholder />}>
          {part.then((props) => (
            <DocsHeading {...props} />
          ))}
        </Suspense>
        <Suspense fallback={<DocsBodyPlaceholder />}>
          {part.then((props) => (
            <DocsContent {...props} />
          ))}
        </Suspense>
      </article>
      <Suspense>
        {part.then((props) => (
          <DocsAdjacentPages {...props} />
        ))}
      </Suspense>
    </>
  );
};

export default Docs;
