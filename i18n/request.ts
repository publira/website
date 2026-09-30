import { hasLocale, IntlErrorCode } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { loadMessages } from "#i18n/messages";
import { routing } from "#i18n/routing";

// The locale comes from the root param rather than from a header the proxy
// sets, so every page under `[locale]` stays eligible for static rendering.
export default getRequestConfig(async () => {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return {
    locale,
    messages: await loadMessages(locale),
    // next-intl logs a missing message and shows its key instead. Throwing
    // fails the prerender, so a gap in a catalog fails the build.
    onError: (error) => {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        throw error;
      }
      console.error(error);
    },
  };
});
