import type { StaticImageData } from "next/image";

import hostCatalog from "#assets/screenshots/01-host-catalog-top.png";
import hostSeriesList from "#assets/screenshots/02-host-series-list.png";
import hostSeriesDetail from "#assets/screenshots/03-host-series-detail.png";
import hostViewer from "#assets/screenshots/04-host-episode-viewer.png";
import hostSearch from "#assets/screenshots/05-host-search.png";
import hostAuthors from "#assets/screenshots/06-host-authors.png";
import adminDashboard from "#assets/screenshots/07-admin-dashboard.png";
import adminSeries from "#assets/screenshots/08-admin-series-list.png";
import adminEpisodes from "#assets/screenshots/09-admin-episode-management.png";
import adminTheme from "#assets/screenshots/10-admin-theme-preview.png";
import adminAuditLog from "#assets/screenshots/11-admin-audit-log.png";
import platformDashboard from "#assets/screenshots/12-platform-dashboard.png";
import platformTenants from "#assets/screenshots/13-platform-tenants.png";

export interface Screenshot {
  readonly caption: string;
  readonly image: StaticImageData;
  readonly title: string;
}

export const heroScreenshot: Screenshot = {
  caption:
    "The catalog of a tenant site, running on the development seed data.",
  image: hostCatalog,
  title: "Catalog",
};

export const hostScreenshots: readonly Screenshot[] = [
  {
    caption:
      "Recommended, new, and recently updated works, with browse entries for series, labels, and authors.",
    image: hostCatalog,
    title: "Catalog",
  },
  {
    caption:
      "Every series published on the tenant, each with its label and its author.",
    image: hostSeriesList,
    title: "Series",
  },
  {
    caption:
      "Synopsis, label, and follow, above the episode list and the free or paid badge each episode carries.",
    image: hostSeriesDetail,
    title: "Series detail",
  },
  {
    caption:
      "The double-page spread, read right to left, rendered by the comic viewer that ships as its own package.",
    image: hostViewer,
    title: "Episode viewer",
  },
  {
    caption: "Published series matched by title and synopsis.",
    image: hostSearch,
    title: "Search",
  },
  {
    caption:
      "The authors published on the tenant, with the number of series behind each name.",
    image: hostAuthors,
    title: "Authors",
  },
];

export const adminScreenshots: readonly Screenshot[] = [
  {
    caption:
      "Published series, draft episodes, and scheduled releases, above the queue of everything that needs attention.",
    image: adminDashboard,
    title: "Dashboard",
  },
  {
    caption:
      "Titles, labels, publication status, and reading period, each row opening editing or episode management.",
    image: adminSeries,
    title: "Series",
  },
  {
    caption:
      "The list, creation, and editing flows in one place, reordered by dragging the cards.",
    image: adminEpisodes,
    title: "Episodes",
  },
  {
    caption:
      "Brand colors edited against a live preview of the public site, which keeps its own colors until the theme is saved.",
    image: adminTheme,
    title: "Theme",
  },
  {
    caption:
      "Who did what, when, and how it turned out, filtered by period, action, or actor in the tenant's time zone.",
    image: adminAuditLog,
    title: "Audit log",
  },
];

export const platformScreenshots: readonly Screenshot[] = [
  {
    caption:
      "Tenant counts, the recent cross-tenant events, and the screens an operator reaches for next.",
    image: platformDashboard,
    title: "Dashboard",
  },
  {
    caption:
      "Tenant-level status and details, kept separate from the tenant console.",
    image: platformTenants,
    title: "Tenants",
  },
];
