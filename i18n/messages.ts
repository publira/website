import type { Locale, Messages } from "next-intl";

// Typing each catalog as the source's shape fails the build when a
// translation is missing a key the source has.
const load = async (catalog: Promise<{ default: Messages }>) => {
  const { default: messages } = await catalog;
  return messages;
};

const catalogs: Record<Locale, () => Promise<Messages>> = {
  en: () => load(import("#messages/en.json")),
  ja: () => load(import("#messages/ja.json")),
  ko: () => load(import("#messages/ko.json")),
  "zh-Hans": () => load(import("#messages/zh-Hans.json")),
  "zh-Hant": () => load(import("#messages/zh-Hant.json")),
};

export const loadMessages = (locale: Locale) => catalogs[locale]();
