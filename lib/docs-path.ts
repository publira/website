import type { Page } from "#lib/site";

// The parts of `lib/docs.ts` a Client Component links with, without the
// GitHub client that comes with it.

export const nextVersion = "next";

/**
 * The newest release, at the URLs without a version (`/docs/<slug>`) that
 * `proxy.ts` rewrites to it.
 */
export const latestVersion = "latest";

/**
 * The list of every version. `proxy.ts` keeps `versions` from naming a page
 * of the newest release.
 */
export const docsVersionsPath = "/docs/versions" satisfies Page;

/**
 * The URL of a page, or of a version's root with no slug, without the locale
 * that `Link` adds. `latest` names no version.
 */
export const getDocsPath = (version: string, slug: readonly string[] = []) =>
  ["/docs", ...(version === latestVersion ? [] : [version]), ...slug].join("/");
