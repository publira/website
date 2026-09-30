import type { Messages } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { StaticImageData } from "next/image";

import adminAnnouncements from "#assets/screenshots/admin/announcements.png";
import adminAppLinks from "#assets/screenshots/admin/app-links.png";
import adminAuditLog from "#assets/screenshots/admin/audit-log.png";
import adminAuthorAccounts from "#assets/screenshots/admin/author-accounts.png";
import adminAuthorRoles from "#assets/screenshots/admin/author-roles.png";
import adminContactMessage from "#assets/screenshots/admin/contact-message.png";
import adminContactMessages from "#assets/screenshots/admin/contact-messages.png";
import adminDashboard from "#assets/screenshots/admin/dashboard.png";
import adminEpisodePages from "#assets/screenshots/admin/episode-pages.png";
import adminEpisodeSchedule from "#assets/screenshots/admin/episode-schedule.png";
import adminEpisodes from "#assets/screenshots/admin/episodes.png";
import adminPageTranslations from "#assets/screenshots/admin/page-translations.png";
import adminPaymentCheckout from "#assets/screenshots/admin/payment-checkout.png";
import adminPaymentInApp from "#assets/screenshots/admin/payment-in-app.png";
import adminReadThrough from "#assets/screenshots/admin/read-through.png";
import adminRoyalties from "#assets/screenshots/admin/royalties.png";
import adminRoyaltyStatement from "#assets/screenshots/admin/royalty-statement.png";
import adminSeriesForm from "#assets/screenshots/admin/series-form.png";
import adminSeriesList from "#assets/screenshots/admin/series-list.png";
import adminSignIn from "#assets/screenshots/admin/sign-in.png";
import adminThemePreview from "#assets/screenshots/admin/theme-preview.png";
import adminTheme from "#assets/screenshots/admin/theme.png";
import hostAuthor from "#assets/screenshots/host/author.png";
import hostAuthors from "#assets/screenshots/host/authors.png";
import hostCatalog from "#assets/screenshots/host/catalog.png";
import hostGenre from "#assets/screenshots/host/genre.png";
import hostGenres from "#assets/screenshots/host/genres.png";
import hostMyPage from "#assets/screenshots/host/my-page.png";
import hostNotificationSettings from "#assets/screenshots/host/notification-settings.png";
import hostPurchases from "#assets/screenshots/host/purchases.png";
import hostRankingDaily from "#assets/screenshots/host/ranking-daily.png";
import hostRankingWeekly from "#assets/screenshots/host/ranking-weekly.png";
import hostSearch from "#assets/screenshots/host/search.png";
import hostSeriesDetail from "#assets/screenshots/host/series-detail.png";
import hostSeriesList from "#assets/screenshots/host/series-list.png";
import hostSignIn from "#assets/screenshots/host/sign-in.png";
import hostSignUp from "#assets/screenshots/host/sign-up.png";
import hostViewerControls from "#assets/screenshots/host/viewer-controls.png";
import hostViewerEnd from "#assets/screenshots/host/viewer-end.png";
import hostViewerSpread from "#assets/screenshots/host/viewer-spread.png";
import mailContactMessage from "#assets/screenshots/mail/contact-message.png";
import mailPasswordReset from "#assets/screenshots/mail/password-reset.png";
import mailVerification from "#assets/screenshots/mail/verification.png";
import mobileAccount from "#assets/screenshots/mobile/account.png";
import mobileAuthor from "#assets/screenshots/mobile/author.png";
import mobileCatalog from "#assets/screenshots/mobile/catalog.png";
import mobileGenre from "#assets/screenshots/mobile/genre.png";
import mobileGenres from "#assets/screenshots/mobile/genres.png";
import mobileLibrary from "#assets/screenshots/mobile/library.png";
import mobileNotifications from "#assets/screenshots/mobile/notifications.png";
import mobilePurchases from "#assets/screenshots/mobile/purchases.png";
import mobileSearch from "#assets/screenshots/mobile/search.png";
import mobileSeriesDetail from "#assets/screenshots/mobile/series-detail.png";
import mobileSignIn from "#assets/screenshots/mobile/sign-in.png";
import mobileViewer from "#assets/screenshots/mobile/viewer.png";
import platformDashboardEvents from "#assets/screenshots/platform/dashboard-events.png";
import platformDashboard from "#assets/screenshots/platform/dashboard.png";
import platformEmail from "#assets/screenshots/platform/email.png";
import platformSecurity from "#assets/screenshots/platform/security.png";
import platformStorage from "#assets/screenshots/platform/storage.png";
import platformTenantMembers from "#assets/screenshots/platform/tenant-members.png";
import platformTenant from "#assets/screenshots/platform/tenant.png";
import platformTenants from "#assets/screenshots/platform/tenants.png";
import platformUsers from "#assets/screenshots/platform/users.png";
import platformWebPush from "#assets/screenshots/platform/web-push.png";

/** One picture of a screen, and what it shows. */
export interface ScreenshotView {
  readonly image: StaticImageData;
  /** The view's name, or the screen's title when it has one view. */
  readonly label: string;
}

/** A screen, told in one picture or in several shown one after another. */
export interface Screenshot {
  readonly caption: string;
  readonly title: string;
  readonly views: readonly [ScreenshotView, ...ScreenshotView[]];
}

type ScreenshotMessages = Messages["screenshots"];

type Group = keyof ScreenshotMessages;

/** A screenshot's key in the catalog, such as `host.catalog`. */
type ScreenshotKey = {
  [G in Group]: `${G}.${keyof ScreenshotMessages[G] & string}`;
}[Group];

/** A view's key in the catalog, such as `host.ranking.views.daily`. */
type ViewKey = {
  [G in Group]: {
    [
      S in keyof ScreenshotMessages[G] & string
    ]: ScreenshotMessages[G][S] extends { views: infer V }
      ? `${G}.${S}.views.${keyof V & string}`
      : never;
  }[keyof ScreenshotMessages[G] & string];
}[Group];

/**
 * A screen with one picture, or with its views in the order they are shown.
 * A view's key names the screen it belongs to, so a view filed under the
 * wrong screen fails the type check.
 */
type Entry =
  | readonly [ScreenshotKey, StaticImageData]
  | readonly [
      ScreenshotKey,
      readonly [
        readonly [ViewKey, StaticImageData],
        ...(readonly [ViewKey, StaticImageData])[],
      ],
    ];

const groups = {
  admin: [
    ["admin.dashboard", adminDashboard],
    [
      "admin.series",
      [
        ["admin.series.views.list", adminSeriesList],
        ["admin.series.views.form", adminSeriesForm],
      ],
    ],
    [
      "admin.episodes",
      [
        ["admin.episodes.views.list", adminEpisodes],
        ["admin.episodes.views.schedule", adminEpisodeSchedule],
        ["admin.episodes.views.pages", adminEpisodePages],
      ],
    ],
    [
      "admin.authors",
      [
        ["admin.authors.views.roles", adminAuthorRoles],
        ["admin.authors.views.accounts", adminAuthorAccounts],
      ],
    ],
    [
      "admin.payments",
      [
        ["admin.payments.views.checkout", adminPaymentCheckout],
        ["admin.payments.views.inApp", adminPaymentInApp],
      ],
    ],
    [
      "admin.signIn",
      [
        ["admin.signIn.views.providers", adminSignIn],
        ["admin.signIn.views.appLinks", adminAppLinks],
      ],
    ],
    [
      "admin.theme",
      [
        ["admin.theme.views.edit", adminTheme],
        ["admin.theme.views.preview", adminThemePreview],
      ],
    ],
    [
      "admin.site",
      [
        ["admin.site.views.pages", adminPageTranslations],
        ["admin.site.views.announcements", adminAnnouncements],
      ],
    ],
    [
      "admin.contact",
      [
        ["admin.contact.views.inbox", adminContactMessages],
        ["admin.contact.views.message", adminContactMessage],
      ],
    ],
    [
      "admin.reports",
      [
        ["admin.reports.views.readThrough", adminReadThrough],
        ["admin.reports.views.royalties", adminRoyalties],
        ["admin.reports.views.statement", adminRoyaltyStatement],
      ],
    ],
    ["admin.auditLog", adminAuditLog],
  ],
  host: [
    ["host.catalog", hostCatalog],
    [
      "host.browse",
      [
        ["host.browse.views.genres", hostGenres],
        ["host.browse.views.genre", hostGenre],
      ],
    ],
    [
      "host.ranking",
      [
        ["host.ranking.views.daily", hostRankingDaily],
        ["host.ranking.views.weekly", hostRankingWeekly],
      ],
    ],
    ["host.seriesList", hostSeriesList],
    ["host.seriesDetail", hostSeriesDetail],
    [
      "host.viewer",
      [
        ["host.viewer.views.spread", hostViewerSpread],
        ["host.viewer.views.controls", hostViewerControls],
        ["host.viewer.views.end", hostViewerEnd],
      ],
    ],
    ["host.search", hostSearch],
    [
      "host.authors",
      [
        ["host.authors.views.list", hostAuthors],
        ["host.authors.views.author", hostAuthor],
      ],
    ],
    [
      "host.signIn",
      [
        ["host.signIn.views.signIn", hostSignIn],
        ["host.signIn.views.signUp", hostSignUp],
      ],
    ],
    [
      "host.account",
      [
        ["host.account.views.myPage", hostMyPage],
        ["host.account.views.purchases", hostPurchases],
        ["host.account.views.notifications", hostNotificationSettings],
      ],
    ],
  ],
  mail: [
    ["mail.verification", mailVerification],
    ["mail.passwordReset", mailPasswordReset],
    ["mail.contactMessage", mailContactMessage],
  ],
  mobile: [
    ["mobile.catalog", mobileCatalog],
    [
      "mobile.browse",
      [
        ["mobile.browse.views.genres", mobileGenres],
        ["mobile.browse.views.genre", mobileGenre],
        ["mobile.browse.views.search", mobileSearch],
      ],
    ],
    [
      "mobile.seriesDetail",
      [
        ["mobile.seriesDetail.views.series", mobileSeriesDetail],
        ["mobile.seriesDetail.views.author", mobileAuthor],
      ],
    ],
    ["mobile.viewer", mobileViewer],
    [
      "mobile.library",
      [
        ["mobile.library.views.library", mobileLibrary],
        ["mobile.library.views.purchases", mobilePurchases],
        ["mobile.library.views.notifications", mobileNotifications],
      ],
    ],
    [
      "mobile.account",
      [
        ["mobile.account.views.account", mobileAccount],
        ["mobile.account.views.signIn", mobileSignIn],
      ],
    ],
  ],
  platform: [
    [
      "platform.dashboard",
      [
        ["platform.dashboard.views.setup", platformDashboard],
        ["platform.dashboard.views.events", platformDashboardEvents],
      ],
    ],
    [
      "platform.tenants",
      [
        ["platform.tenants.views.list", platformTenants],
        ["platform.tenants.views.profile", platformTenant],
        ["platform.tenants.views.members", platformTenantMembers],
      ],
    ],
    ["platform.users", platformUsers],
    [
      "platform.settings",
      [
        ["platform.settings.views.storage", platformStorage],
        ["platform.settings.views.email", platformEmail],
        ["platform.settings.views.security", platformSecurity],
        ["platform.settings.views.webPush", platformWebPush],
      ],
    ],
  ],
} satisfies Record<Group, readonly Entry[]>;

/** Every group of screenshots, titled and captioned in the request's locale. */
export const getScreenshots = async (): Promise<
  Record<Group, readonly Screenshot[]>
> => {
  const t = await getTranslations("screenshots");
  const localize = (entries: readonly Entry[]): readonly Screenshot[] =>
    entries.map(([key, source]) => {
      const title = t(`${key}.title`);
      const caption = t(`${key}.caption`);
      if ("src" in source) {
        return { caption, title, views: [{ image: source, label: title }] };
      }
      const [first, ...rest] = source;
      const toView = ([viewKey, image]: readonly [
        ViewKey,
        StaticImageData,
      ]) => ({ image, label: t(viewKey) });
      return { caption, title, views: [toView(first), ...rest.map(toView)] };
    });

  return {
    admin: localize(groups.admin),
    host: localize(groups.host),
    mail: localize(groups.mail),
    mobile: localize(groups.mobile),
    platform: localize(groups.platform),
  };
};

/**
 * The views of one screenshot with the copy its dialog needs: what opens each
 * view, and where the view sits among the others.
 */
export const getDialogViews = async (
  screenshot: Screenshot,
  address: string
): Promise<DialogView[]> => {
  const t = await getTranslations("screens.dialog");
  const total = screenshot.views.length;

  return screenshot.views.map((view, index) => ({
    ...view,
    openLabel:
      total === 1
        ? t("open", { address, title: screenshot.title })
        : t("openView", { address, title: screenshot.title, view: view.label }),
    position: t("position", { current: index + 1, total }),
  }));
};

/** A view as the dialog shows it, with the copy the server composed for it. */
export interface DialogView extends ScreenshotView {
  /** The accessible name of the control that opens the dialog on this view. */
  readonly openLabel: string;
  /** Where the view sits among the others, such as "2 of 3". */
  readonly position: string;
}
