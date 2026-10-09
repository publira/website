import { hasLocale } from "next-intl";

import { routing } from "#i18n/routing";
import { findDocsImage, getBlob } from "#lib/docs";

// A year, the usual `max-age` of a file whose URL names its content.
const oneYearInSeconds = 365 * 24 * 60 * 60;

// An image at the URL that names its blob, which only ever serves that blob.
// `images` sits where a version would, and no version is named so. The URL
// has no version, so the versions share an image they have in common.
const serveImage = async (
  _request: Request,
  { params }: RouteContext<"/[locale]/docs/images/[sha]/[...path]">
) => {
  const { locale, path, sha } = await params;
  const image = hasLocale(routing.locales, locale)
    ? await findDocsImage(locale, sha, path)
    : undefined;
  if (!image) {
    return new Response(null, { status: 404 });
  }

  return new Response(await getBlob(image.sha), {
    headers: {
      "cache-control": `public, max-age=${oneYearInSeconds}, immutable`,
      // An SVG opened on its own runs no script and loads nothing.
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "content-type": image.type,
      "x-content-type-options": "nosniff",
    },
  });
};

export { serveImage as GET };
