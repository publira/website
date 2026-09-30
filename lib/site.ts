const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

/** The production origin, which every deployment's absolute URLs point at. */
export const productionUrl = productionHost
  ? new URL(`https://${productionHost}`)
  : null;

/** The GitHub organization's avatar, which stands in for a logo. */
export const organizationAvatarUrl =
  "https://avatars.githubusercontent.com/u/268482084?v=4";
