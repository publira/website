import createMiddleware from "next-intl/middleware";

import { routing } from "#i18n/routing";

// A path without a locale is rewritten to the default one, so `/` renders
// `[locale]` as English while its URL stays `/`.
export default createMiddleware(routing);

export const config = {
  // Skip Next.js internals and anything with a file extension.
  matcher: "/((?!_next|.*\\..*).*)",
};
