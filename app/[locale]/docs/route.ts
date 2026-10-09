import { hasLocale } from "next-intl";
import { redirect } from "next/navigation";

import { routing } from "#i18n/routing";
import { getCurrentVersion, getLocalizedDocsPath } from "#lib/docs";

// `/docs` opens the newest version. It shows nothing of its own, so it is a
// Route Handler rather than a page.
const redirectToCurrentVersion = async (
  _request: Request,
  { params }: RouteContext<"/[locale]/docs">
) => {
  const { locale } = await params;
  redirect(
    getLocalizedDocsPath(
      hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
      await getCurrentVersion()
    )
  );
};

export { redirectToCurrentVersion as GET };
