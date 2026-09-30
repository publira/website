const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

/** The production origin, which every deployment's absolute URLs point at. */
export const productionUrl = productionHost
  ? new URL(`https://${productionHost}`)
  : null;

/**
 * A path on the production origin. Without one, as in a local build, the path
 * stays relative, which is also how the pages write their canonical URLs then.
 */
export const getAbsoluteUrl = (path: string) => {
  if (!productionUrl) {
    return path;
  }
  const url = new URL(path, productionUrl);
  // Next.js writes a page's canonical URL for the root as the bare origin, and
  // the sitemap has to repeat it character for character.
  return url.pathname === "/" ? url.origin : url.href;
};

/** Every page the site serves, by its path in the default locale. */
export const pages = ["/", "/privacy", "/terms"] as const;

export type Page = (typeof pages)[number];

/** The GitHub organization's avatar, which stands in for a logo. */
export const organizationAvatarUrl =
  "https://avatars.githubusercontent.com/u/268482084?v=4";
