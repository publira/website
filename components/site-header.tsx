import { getTranslations } from "next-intl/server";

import { LocaleMenu } from "#components/locale-menu";
import { Link } from "#i18n/navigation";
import { routing } from "#i18n/routing";

const navigation = [
  "platform",
  "screens",
  "architecture",
  "libraries",
  "start",
] as const;

/** A locale's name in its own language. */
const autonym = (locale: string) =>
  new Intl.DisplayNames(locale, { type: "language" }).of(locale) ?? locale;

export const SiteHeader = async () => {
  const t = await getTranslations();

  return (
    <header className="border-border bg-surface sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link className="flex items-baseline gap-3" href="/">
          <span className="font-display text-foreground text-xl">
            {t("site.name")}
          </span>
          <span className="text-muted-foreground hidden text-sm whitespace-nowrap sm:inline lg:hidden xl:inline">
            {t("header.tagline")}
          </span>
        </Link>

        <nav
          aria-label={t("header.sectionsLabel")}
          className="ml-auto hidden items-center gap-6 lg:flex"
        >
          {navigation.map((section) => (
            <a
              className="text-muted-foreground hover:text-foreground text-sm whitespace-nowrap"
              href={`#${section}`}
              key={section}
            >
              {t(`header.navigation.${section}`)}
            </a>
          ))}
        </nav>

        <div className="ml-auto lg:ml-0">
          <LocaleMenu
            label={t("header.localeLabel")}
            options={routing.locales.map((locale) => ({
              locale,
              name: autonym(locale),
            }))}
          />
        </div>

        <a
          className="border-primary text-primary hover:bg-accent rounded-sm border px-4 py-2 text-sm font-medium whitespace-nowrap"
          href="https://github.com/publira/publira"
          rel="noreferrer"
          target="_blank"
        >
          {t("header.github")}
        </a>
      </div>
    </header>
  );
};
