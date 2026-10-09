import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "#i18n/routing";

// A path without a locale is rewritten to the default one, so `/` renders
// `[locale]` as English while its URL stays `/`.
const handleI18nRouting = createMiddleware(routing);

const proxy = (request: NextRequest) => {
  // The documentation is in English alone, so a locale's `/docs` leads to it.
  const [, locale, ...path] = request.nextUrl.pathname.split("/");
  if (hasLocale(routing.locales, locale) && path[0] === "docs") {
    const url = request.nextUrl.clone();
    url.pathname = `/${path.join("/")}`;
    return NextResponse.redirect(url);
  }
  return handleI18nRouting(request);
};

export default proxy;

export const config = {
  matcher: [
    // Skip Next.js internals, the Route Handlers under `/api/`, anything with
    // a file extension, and the icons, which live outside `[locale]`.
    "/((?!_next|api/|icon$|apple-icon$|.*\\..*).*)",
    // A docs version has a dot (`/docs/v1.2/...`), but a docs image, a file
    // below the version or below `/docs/images/`, is served outside `[locale]`.
    "/docs/:path((?![^/]+/.*\\.[^/]*$).*)",
    // A locale's docs URL redirects, dots and all.
    "/:locale/docs/:path*",
  ],
};
