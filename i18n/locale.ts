import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";

import { routing } from "#i18n/routing";

/** The `[locale]` root param, or not found for one the site does not have. */
export const getRootLocale = async () => {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return locale;
};
