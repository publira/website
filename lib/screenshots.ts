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
import adminTheme from "#assets/screenshots/14-admin-theme.png";
import adminThemePreview from "#assets/screenshots/15-admin-theme-preview.png";
import adminAuditLog from "#assets/screenshots/16-admin-audit-log.png";
import platformDashboard from "#assets/screenshots/17-platform-dashboard.png";
import platformTenants from "#assets/screenshots/18-platform-tenants.png";
import platformUsers from "#assets/screenshots/19-platform-users.png";
import mobileCatalog from "#assets/screenshots/20-mobile-catalog.png";
import mobileSeriesDetail from "#assets/screenshots/21-mobile-series-detail.png";
import mobileViewer from "#assets/screenshots/22-mobile-episode-viewer.png";

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
      "The work the tenant is leading with, above the shelves the rest of the page is built from: the week's chart, the newest episodes, and the labels and authors it wants read. Search, the language switcher, and the reader's own account sit in the header, all under the publisher's brand rather than Publira's.",
    image: hostCatalog,
    title: "Catalog",
  },
  {
    caption:
      "Genres carrying the number of series behind each one, and the week laid out a day at a time. Both are the tenant's own classification rather than a fixed list, so what a reader browses by is what the editorial console defined.",
    image: hostBrowse,
    title: "Browse",
  },
  {
    caption:
      "The daily chart and the weekly one, each row carrying how far the series moved since the chart before it. The positions come from what readers did — episodes opened and reacted to — aggregated by a batch job rather than arranged by hand.",
    image: hostRanking,
    title: "Ranking",
  },
  {
    caption:
      "Every published series, sorted and narrowed by genre, by serialization status, or down to the ones with free episodes. An age-rated title is marked wherever it is listed and stays hidden until the reader has confirmed they can see it.",
    image: hostSeriesList,
    title: "Series",
  },
  {
    caption:
      "The cover, synopsis, label, genres, and tags, with Follow and Share beside them. The episodes run below in reading order, each marked free or paid, so what can be read now is clear before anyone signs in.",
    image: hostSeriesDetail,
    title: "Series detail",
  },
  {
    caption:
      "A page spread read right to left, drawn on a canvas rather than as images the document lays out. The viewer is the package published on npm rather than something bespoke to this screen, so the paging, the spread, and the direction are the library's behaviour.",
    image: hostViewer,
    title: "Episode viewer",
  },
  {
    caption:
      "One keyword answered by the series, the authors, and the labels that match it, each group opening into a list of its own. Only what the tenant has published is searchable, so nothing still sitting in the editorial queue can be reached from here.",
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
      "Titles, labels, publication dates, reading period, age rating, and status in one table, narrowed by serialization state or by rating. Editing and episode management open from every row, and new series start here too, so the whole catalog is reachable from a single screen.",
    image: adminSeries,
    title: "Series",
  },
  {
    caption:
      "One series in detail: title, synopsis, reading period, label, and a credit for every author in the role they hold, dragged into the order the credits are shown in. Those credits are the template its new episodes are created from, and changing them leaves the episodes that already exist as they were.",
    image: adminSeriesForm,
    title: "Series form",
  },
  {
    caption:
      "Every episode of one series in the order readers meet them, each card showing its publication status and its price. Reading order is what a reader sees, so the cards are dragged into it — or moved with an arrow key — rather than renumbered by hand.",
    image: adminEpisodes,
    title: "Episodes",
  },
  {
    caption:
      "The roles this tenant credits authors in, renamed and moved into the priority the credits follow. The vocabulary belongs to the tenant, so a publisher that separates the artist from the writer says so here instead of living with a fixed list.",
    image: adminAuthorRoles,
    title: "Author roles",
  },
  {
    caption:
      "The brand colors, the text drawn on each of them, and the typefaces readers see first, beside the logo and the icon the public site carries. All of it is per tenant, so two publishers on one install share no part of their look.",
    image: adminTheme,
    title: "Theme",
  },
  {
    caption:
      "The colors being edited, shown on the parts a public site is built from — the header, the shelves, the badges, and the buttons. The preview follows every edit while the public site keeps its current colors, so nothing reaches readers until the theme is saved.",
    image: adminThemePreview,
    title: "Theme preview",
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
  {
    caption:
      "The readers of every tenant in one list, with the tenant they belong to, the day they registered, and their status. This is where an operator suspends or removes an account, while what those readers may read stays with the tenant that published it.",
    image: platformUsers,
    title: "Users",
  },
];

export const mobileScreenshots: readonly Screenshot[] = [
  {
    caption:
      "The week's chart and the newest arrivals above the whole catalog, which asks for another page as the reader scrolls. The app calls the same public API the site does, so a tenant publishes once and both surfaces show it.",
    image: mobileCatalog,
    title: "Catalog",
  },
  {
    caption:
      "Cover, credits, genres, and the episode list, with following offered behind a sign-in. An age-rated series is marked and gated here the way it is on the site.",
    image: mobileSeriesDetail,
    title: "Series detail",
  },
  {
    caption:
      "The episode the site serves, turned a page at a time with the controls along the bottom. What a member has opened is kept on the device as well, so an episode already read turns again with no network at all.",
    image: mobileViewer,
    title: "Episode viewer",
  },
];
