import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  defaultLocale: "en",
  // A reader lands on the locale the URL names, and nothing else: no cookie,
  // no `Accept-Language`, and no redirect away from the page that was asked for.
  localeCookie: false,
  localeDetection: false,
  // English is served without a prefix (`/`), every other locale with one (`/ja`).
  localePrefix: "as-needed",
  locales: ["en", "ja"],
});
