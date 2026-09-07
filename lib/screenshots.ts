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
      "Recommended, new, and recently updated works, with browse entries for series, labels, and authors. Search, the language switcher, and the reader's own account sit in the header, all under the publisher's brand rather than Publira's.",
    image: hostCatalog,
    title: "Catalog",
  },
  {
    caption:
      "Every series published on the tenant, each card carrying its author and the label it belongs to above the opening line of its synopsis. It is the list a reader reaches from the header, drawn from the same records the editorial console publishes.",
    image: hostSeriesList,
    title: "Series",
  },
  {
    caption:
      "The cover, synopsis, author, and label, with Follow beside the title for a reader who wants the next episode. The episodes run below in reading order, each marked free or paid, so what can be read now is clear before anyone signs in.",
    image: hostSeriesDetail,
    title: "Series detail",
  },
  {
    caption:
      "A double-page spread read right to left, its page numbers running above it. The viewer is the package published on npm rather than something bespoke to this screen, so the paging, the spread, and the direction are the library's behaviour.",
    image: hostViewer,
    title: "Episode viewer",
  },
  {
    caption:
      "Published series matched by title and synopsis, returned in the cards the catalog already uses. Only what the tenant has published is searchable, so nothing still sitting in the editorial queue can be reached from here.",
    image: hostSearch,
    title: "Search",
  },
  {
    caption:
      "The authors published on the tenant, with the number of series behind each name. An author is a profile the editorial console manages, so one name carries across every series credited to it.",
    image: hostAuthors,
    title: "Authors",
  },
];

export const adminScreenshots: readonly Screenshot[] = [
  {
    caption:
      "Published series, draft episodes, and scheduled releases, above the queue of everything still needing attention. The queue gathers the drafts and the upcoming releases, so an editor opening the console is shown what is waiting rather than having to go looking for it.",
    image: adminDashboard,
    title: "Dashboard",
  },
  {
    caption:
      "Titles, labels, publication dates, reading period, synopsis, and status in one table, with editing and episode management on every row. New series start here too, so the whole catalog is reachable from a single screen.",
    image: adminSeries,
    title: "Series",
  },
  {
    caption:
      "The list, the creation flow, and the editing flow for one series' episodes in a single place, each card showing its publication status and its price. Reading order is what a reader sees, so the cards are dragged into it rather than renumbered by hand.",
    image: adminEpisodes,
    title: "Episodes",
  },
  {
    caption:
      "Brand colors edited against a live preview built from the same parts as the public site — the header, the recommended works, the badges, and the buttons. The preview follows every edit while the public site keeps its current colors, so nothing reaches readers until the theme is saved.",
    image: adminTheme,
    title: "Theme",
  },
  {
    caption:
      "Who did what, when, and how it turned out, with the actor and the record each action touched. It filters by period, action, or actor, and the dates are read as calendar days in the tenant's own time zone rather than the server's.",
    image: adminAuditLog,
    title: "Audit log",
  },
];

export const platformScreenshots: readonly Screenshot[] = [
  {
    caption:
      "Total, active, and suspended tenants beside the users still pending, above the recent cross-tenant events — tenants created, roles granted, accounts added. The screens an operator reaches for next sit alongside them, so the status and the action it calls for are on one page.",
    image: platformDashboard,
    title: "Dashboard",
  },
  {
    caption:
      "Every registered tenant with its status and the day it was created, searchable by name or ID. This console manages tenant-level status alone and stays out of the catalog, which each tenant runs from its own editorial console.",
    image: platformTenants,
    title: "Tenants",
  },
];
