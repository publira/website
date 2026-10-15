import { getTranslations } from "next-intl/server";

import { ScreenGrid } from "#components/screen-grid";
import { ScreenGroup } from "#components/screen-group";
import { Link } from "#i18n/navigation";
import { getScreenshots } from "#lib/screenshots";

// `id` is the group's fragment on `/screenshots`, named after the app.
const groups = [
  {
    address: "publisher.example",
    app: "apps/web-storefront",
    frame: "browser",
    id: "storefront",
    key: "host",
  },
  {
    address: "admin.publisher.example",
    app: "apps/web-admin",
    frame: "browser",
    id: "admin",
    key: "admin",
  },
  {
    address: "platform.publira.example",
    app: "apps/web-platform",
    frame: "browser",
    id: "platform",
    key: "platform",
  },
  { app: "mobile", frame: "phone", id: "mobile", key: "mobile" },
  { app: "apps/email-renderer", frame: "mail", id: "mail", key: "mail" },
] as const;

interface ScreenGroupsProps {
  /**
   * Whether to show each app's featured screens in one row, linking to the
   * rest, rather than every screen.
   */
  readonly featured?: boolean;
}

/** Every app's screens, as the home page and `/screenshots` show them. */
export const ScreenGroups = async ({ featured = false }: ScreenGroupsProps) => {
  const [t, screenshots] = await Promise.all([
    getTranslations("screens"),
    getScreenshots(),
  ]);

  return (
    <div className={featured ? "space-y-20" : "space-y-28"}>
      {groups.map((group) => {
        const all = screenshots[group.key];
        const shown = featured
          ? all.filter((screenshot) => screenshot.featured)
          : all;
        const props = {
          address:
            "address" in group ? group.address : t(`${group.key}.address`),
          app: group.app,
          description: t(`${group.key}.description`),
          // The home page holds the groups in a section of its own.
          heading: featured ? ("h3" as const) : ("h2" as const),
          // The home page has its own `#platform`, the platform's features.
          id: featured ? undefined : group.id,
          more:
            shown.length < all.length ? (
              <Link
                className="border-primary text-primary hover:bg-accent inline-block rounded-sm border px-5 py-2.5 text-sm font-medium"
                href={`/screenshots#${group.id}`}
              >
                {t("seeAll", { count: all.length })}
              </Link>
            ) : undefined,
          screenshots: shown,
          title: t(`${group.key}.title`),
        };

        // `/screenshots` gives a page's screens the width, sides alternating;
        // the home page puts them in one row, as it does the others.
        return group.frame === "browser" && !featured ? (
          <ScreenGroup key={group.id} {...props} />
        ) : (
          <ScreenGrid
            key={group.id}
            {...props}
            frame={group.frame}
            strip={featured}
          />
        );
      })}
    </div>
  );
};
