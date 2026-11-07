import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";

import { DocsSidebarNavigation } from "#components/docs-sidebar-navigation";
import { getRootLocale } from "#i18n/locale";
import {
  getCurrentVersion,
  getDocsNavigation,
  getDocsVersions,
  getMenuVersions,
  getServedSlugs,
  latestVersion,
} from "#lib/docs";

interface DocsSidebarProps {
  /** The version the URL names: `latest` for the newest release. */
  readonly version: string;
}

/**
 * The version menu and the version's pages, the same on each of its pages, so
 * cached by the version and the locale alone.
 */
export const DocsSidebar = async ({ version: segment }: DocsSidebarProps) => {
  "use cache: remote";
  cacheLife("max");

  const [locale, t, latest, versions] = await Promise.all([
    getRootLocale(),
    getTranslations(),
    getCurrentVersion(),
    getDocsVersions(),
  ]);

  const version = segment === latestVersion ? latest : segment;

  if (!versions.some(({ name }) => name === version)) {
    return null;
  }

  const [pages, menu] = await Promise.all([
    getDocsNavigation(version, locale),
    Promise.all(
      getMenuVersions(versions, version).map(async ({ name }) => ({
        name,
        slugs: await getServedSlugs(name, locale),
      }))
    ),
  ]);

  return (
    <DocsSidebarNavigation
      allVersionsLabel={t("docs.allVersions")}
      navigationLabel={t("docs.navigationLabel")}
      pages={pages.map(({ language, path, slug, title }) => ({
        language,
        path,
        slug,
        title,
      }))}
      segment={segment}
      version={version}
      versionLabel={t("docs.versionLabel")}
      versions={menu}
    />
  );
};
