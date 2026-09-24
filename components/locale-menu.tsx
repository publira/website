"use client";

import type { Locale } from "next-intl";
import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";

import { Link } from "#i18n/navigation";

interface LocaleOption {
  readonly locale: Locale;
  /** The locale's name in its own language, so each reader can find theirs. */
  readonly name: string;
}

interface LocaleMenuProps {
  readonly label: string;
  readonly options: readonly LocaleOption[];
}

/**
 * The locales as a disclosure rather than a row of links, so the header keeps
 * its width however many there are. It opens and closes without JavaScript;
 * the effect only adds closing on Escape and on a click outside it. Switching
 * is a client-side navigation, so the scripts already loaded stay.
 */
export const LocaleMenu = ({ label, options }: LocaleMenuProps) => {
  const current = useLocale();
  const currentName = options.find(({ locale }) => locale === current)?.name;
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Next.js keeps a page it has shown, so a menu left open would still be
  // open when the reader comes back to that locale.
  const close = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        details.open &&
        event.target instanceof Node &&
        !details.contains(event.target)
      ) {
        details.open = false;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (details.open && event.key === "Escape") {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    };

    document.addEventListener("click", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <details className="group relative" ref={detailsRef}>
      <summary
        aria-label={`${label}: ${currentName}`}
        className="text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-1.5 text-sm whitespace-nowrap [&::-webkit-details-marker]:hidden"
      >
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
        <svg
          aria-hidden="true"
          className="size-3 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <ul className="border-border bg-popover absolute right-0 z-10 mt-2 min-w-36 rounded-md border py-1 text-sm shadow-sm">
        {options.map(({ locale, name }) => (
          <li key={locale}>
            <Link
              aria-current={locale === current ? "page" : undefined}
              className="hover:bg-accent text-foreground aria-[current=page]:text-primary block px-4 py-2 aria-[current=page]:font-medium"
              href="/"
              lang={locale}
              locale={locale}
              onClick={close}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
};
