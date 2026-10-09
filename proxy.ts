import createMiddleware from "next-intl/middleware";

import { routing } from "#i18n/routing";

// A path without a locale is rewritten to the default one, so `/` renders
// `[locale]` as English while its URL stays `/`.
const proxy = createMiddleware(routing);

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
