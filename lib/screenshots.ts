import type { Messages } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { StaticImageData } from "next/image";

import hostCatalog from "#assets/screenshots/01-host-catalog-top.png";
import hostBrowse from "#assets/screenshots/02-host-browse.png";
import hostRanking from "#assets/screenshots/03-host-ranking.png";
import hostSeriesList from "#assets/screenshots/04-host-series-list.png";
import hostSeriesDetail from "#assets/screenshots/05-host-series-detail.png";
import hostViewer from "#assets/screenshots/06-host-episode-viewer.png";
import hostSearch from "#assets/screenshots/07-host-search.png";
import hostAuthors from "#assets/screenshots/08-host-authors.png";
import adminDashboard from "#assets/screenshots/09-admin-dashboard.png";
import adminSeries from "#assets/screenshots/10-admin-series-list.png";
import adminSeriesForm from "#assets/screenshots/11-admin-series-form.png";
import adminEpisodes from "#assets/screenshots/12-admin-episode-management.png";
import adminAuthorRoles from "#assets/screenshots/13-admin-author-roles.png";
import adminRoyalties from "#assets/screenshots/14-admin-royalties.png";
import adminTheme from "#assets/screenshots/15-admin-theme.png";
import adminThemePreview from "#assets/screenshots/16-admin-theme-preview.png";
import adminAuditLog from "#assets/screenshots/17-admin-audit-log.png";
import platformDashboard from "#assets/screenshots/18-platform-dashboard.png";
import platformTenants from "#assets/screenshots/19-platform-tenants.png";
import platformUsers from "#assets/screenshots/20-platform-users.png";
import platformStorage from "#assets/screenshots/21-platform-storage.png";
import mobileCatalog from "#assets/screenshots/22-mobile-catalog.png";
import mobileSearch from "#assets/screenshots/23-mobile-search.png";
import mobileSeriesDetail from "#assets/screenshots/24-mobile-series-detail.png";
import mobileViewer from "#assets/screenshots/25-mobile-episode-viewer.png";
import mobileAuthor from "#assets/screenshots/26-mobile-author.png";
import mobileLibrary from "#assets/screenshots/27-mobile-library.png";

export interface Screenshot {
  readonly caption: string;
  readonly image: StaticImageData;
  readonly title: string;
}

type ScreenshotMessages = Messages["screenshots"];

/** A screenshot's key in the catalog, such as `host.catalog`. */
type ScreenshotKey = {
  [
    Group in keyof ScreenshotMessages
  ]: `${Group}.${keyof ScreenshotMessages[Group] & string}`;
}[keyof ScreenshotMessages];

const groups = {
  admin: [
    ["admin.dashboard", adminDashboard],
    ["admin.series", adminSeries],
    ["admin.seriesForm", adminSeriesForm],
    ["admin.episodes", adminEpisodes],
    ["admin.authorRoles", adminAuthorRoles],
    ["admin.royalties", adminRoyalties],
    ["admin.theme", adminTheme],
    ["admin.themePreview", adminThemePreview],
    ["admin.auditLog", adminAuditLog],
  ],
  host: [
    ["host.catalog", hostCatalog],
    ["host.browse", hostBrowse],
    ["host.ranking", hostRanking],
    ["host.seriesList", hostSeriesList],
    ["host.seriesDetail", hostSeriesDetail],
    ["host.viewer", hostViewer],
    ["host.search", hostSearch],
    ["host.authors", hostAuthors],
  ],
  mobile: [
    ["mobile.catalog", mobileCatalog],
    ["mobile.search", mobileSearch],
    ["mobile.seriesDetail", mobileSeriesDetail],
    ["mobile.viewer", mobileViewer],
    ["mobile.author", mobileAuthor],
    ["mobile.library", mobileLibrary],
  ],
  platform: [
    ["platform.dashboard", platformDashboard],
    ["platform.tenants", platformTenants],
    ["platform.users", platformUsers],
    ["platform.storage", platformStorage],
  ],
} satisfies Record<
  keyof ScreenshotMessages,
  readonly (readonly [ScreenshotKey, StaticImageData])[]
>;

/** Every group of screenshots, titled and captioned in the request's locale. */
export const getScreenshots = async (): Promise<
  Record<keyof typeof groups, readonly Screenshot[]>
> => {
  const t = await getTranslations("screenshots");
  const localize = (
    entries: readonly (readonly [ScreenshotKey, StaticImageData])[]
  ) =>
    entries.map(([key, image]) => ({
      caption: t(`${key}.caption`),
      image,
      title: t(`${key}.title`),
    }));

  return {
    admin: localize(groups.admin),
    host: localize(groups.host),
    mobile: localize(groups.mobile),
    platform: localize(groups.platform),
  };
};
