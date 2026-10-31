import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "#i18n/routing";

// A path without a locale is rewritten to the default one, so `/` renders
// `[locale]` as English while its URL stays `/`.
const handleI18nRouting = createMiddleware(routing);

// The segments below `/docs` that are not a page's.
const docsSegment = /^(?:next|latest|images|versions|v\d+\.\d+)$/u;

const proxy = (request: NextRequest) => {
  const response = handleI18nRouting(request);

  if (response.headers.has("location")) {
    return response;
  }

  const url = new URL(
    response.headers.get("x-middleware-rewrite") ?? request.url
  );

  // `/<locale>/docs/...` once the locale is resolved.
  const [, locale, root, ...rest] = url.pathname.split("/");
  const [segment = ""] = rest;

  if (root !== "docs") {
    return response;
  }

  // A docs URL without a version is the newest release's, which `[version]`
  // serves as `latest` (`latestVersion` in `lib/docs.ts`). The release is not
  // read here, since proxy cannot use the cache that holds it.
  const unversioned = !docsSegment.test(segment);

  if (!unversioned && segment !== "latest") {
    return response;
  }

  // next-intl's `Link` alternates name the URL as requested, while a `latest`
  // page names the versioned ones.
  response.headers.delete("link");

  if (!unversioned) {
    return response;
  }

  url.pathname = ["", locale, root, "latest", ...rest].join("/");
  // next-intl passes a path that names its locale through rather than
  // rewriting it. Its other headers, such as the locale, are kept.
  response.headers.delete("x-middleware-next");

  return NextResponse.rewrite(url, { headers: response.headers });
};

export default proxy;

export const config = {
  matcher: [
    // Skip Next.js internals, the Route Handlers under `/api/`, anything with
    // a file extension, and the icons, which live outside `[locale]`.
    "/((?!_next|api/|icon$|apple-icon$|.*\\..*).*)",
    // A docs version has a dot (`/docs/v1.2/...`), and so does a docs image.
    "/docs/:path*",
    "/:locale/docs/:path*",
  ],
};
