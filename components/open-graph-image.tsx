import colors from "@publira/design-tokens/tokens/color.tokens.json";
import { createTranslator, hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { loadMessages } from "#i18n/messages";
import { routing } from "#i18n/routing";
import { loadGoogleFont, loadOrganizationAvatar } from "#lib/image-assets";

const {
  background,
  border,
  foreground,
  "muted-foreground": muted,
  secondary,
} = colors.color;

// Each script gets the Noto family drawn for it, so Korean and Chinese are not
// set with Japanese glyph forms.
const families: Record<Locale, string> = {
  en: "Noto Serif",
  ja: "Noto Serif JP",
  ko: "Noto Serif KR",
  "zh-Hans": "Noto Serif SC",
  "zh-Hant": "Noto Serif TC",
};

const hiragana = /^\p{Script=Hiragana}+$/u;

/** A title cut into words, each carrying the particle and punctuation after it. */
const toPhrases = (locale: Locale, text: string) => {
  const phrases: { start: number; text: string }[] = [];
  const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
  for (const { index, isWordLike, segment } of segmenter.segment(text)) {
    const previous = phrases.at(-1);
    if (previous && (!isWordLike || hiragana.test(segment))) {
      previous.text += segment;
    } else {
      phrases.push({ start: index, text: segment });
    }
  }
  return phrases;
};

export const openGraphImage = {
  contentType: "image/png",
  size: { height: 630, width: 1200 },
} as const;

/** The locale an image route was asked for, or a 404. */
export const toLocale = (locale: string) => {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return locale;
};

export const getTranslator = async (locale: Locale) =>
  createTranslator({ locale, messages: await loadMessages(locale) });

export const renderOpenGraphImage = async (locale: Locale, title: string) => {
  const t = await getTranslator(locale);
  const siteName = t("site.name");
  const family = families[locale];
  const [font, avatar] = await Promise.all([
    loadGoogleFont(family, `${siteName}${title}`),
    loadOrganizationAvatar(),
  ]);

  return new ImageResponse(
    <div
      lang={locale}
      style={{
        backgroundColor: background.$value.hex,
        borderBottom: `12px solid ${secondary.$value.hex}`,
        color: foreground.$value.hex,
        display: "flex",
        flexDirection: "column",
        fontFamily: family,
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 80px",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          borderBottom: `2px solid ${border.$value.hex}`,
          color: muted.$value.hex,
          display: "flex",
          fontSize: 40,
          gap: 20,
          paddingBottom: 28,
        }}
      >
        <div
          style={{
            backgroundImage: `url(${avatar})`,
            backgroundSize: "100% 100%",
            height: 56,
            width: 56,
          }}
        />
        {siteName}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          fontSize: 72,
          lineHeight: 1.25,
          textWrap: "balance",
          wordBreak: locale === "ko" ? "keep-all" : "normal",
        }}
      >
        {/* Satori has no `word-break: auto-phrase`, which the page sets on
            Japanese headings, so the phrases are laid out one by one. */}
        {locale === "ja"
          ? toPhrases(locale, title).map(({ start, text }) => (
              <span key={start} style={{ whiteSpace: "pre" }}>
                {text}
              </span>
            ))
          : title}
      </div>
    </div>,
    {
      ...openGraphImage.size,
      fonts: [{ data: font, name: family, style: "normal", weight: 400 }],
    }
  );
};
