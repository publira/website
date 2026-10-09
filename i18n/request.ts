import { IntlErrorCode } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { getRootLocale } from "#i18n/locale";
import { loadMessages } from "#i18n/messages";

// The locale comes from the root param rather than from a header the proxy
// sets, so every page under `[locale]` stays eligible for static rendering.
export default getRequestConfig(async () => {
  const locale = await getRootLocale();

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
