"use client";

import type { Locale } from "next-intl";
import { useLocale } from "next-intl";

import { Menu } from "#components/menu";
import { Link, usePathname } from "#i18n/navigation";

interface LocaleOption {
  readonly locale: Locale;
  /** The locale's name in its own language, so each reader can find theirs. */
  readonly name: string;
}

interface LocaleMenuProps {
  /** Where each locale leads, when the page is not served in every locale. */
  readonly href?: string;
  readonly label: string;
  readonly options: readonly LocaleOption[];
}

/**
 * The locales, in a menu. Switching keeps the reader on the same page in the
 * other locale, as a client-side navigation, so the scripts already loaded
 * stay.
 */
export const LocaleMenu = ({ href, label, options }: LocaleMenuProps) => {
  const current = useLocale();
  // The path without its locale prefix, which `Link` prefixes again.
  const pathname = usePathname();
  const currentName = options.find(({ locale }) => locale === current)?.name;
  // A page served in one locale alone leads every locale to its home page,
  // so the current locale's link is not this page.
  const currentLink = href ? "true" : "page";

  return (
    <Menu
      label={`${label}: ${currentName}`}
      summary={
        <>
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.7 3.75 5.7 3.75 9S14.5 18.3 12 21M12 3C9.5 5.7 8.25 8.7 8.25 12S9.5 18.3 12 21" />
          </svg>
          <span lang={current}>{currentName}</span>
        </>
      }
      summaryClassName="text-muted-foreground hover:text-foreground"
    >
      {options.map(({ locale, name }) => (
        <li key={locale}>
          <Link
            aria-current={locale === current ? currentLink : undefined}
            className="hover:bg-accent text-foreground [&[aria-current]]:text-primary block px-4 py-2 [&[aria-current]]:font-medium"
            href={href ?? pathname}
            lang={locale}
            locale={locale}
          >
            {name}
          </Link>
        </li>
      ))}
    </Menu>
  );
};
