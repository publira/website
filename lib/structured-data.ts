import type { Locale } from "next-intl";

import { getPathname } from "#i18n/navigation";
import { routing } from "#i18n/routing";
import { getAbsoluteUrl } from "#lib/site";
import type { Page } from "#lib/site";

type JsonLdValue =
  | string
  | number
  | readonly JsonLdValue[]
  | { readonly [property: string]: JsonLdValue | undefined };

/** A node of a JSON-LD graph. A property left `undefined` is not written. */
export interface StructuredDataNode {
  readonly [property: string]: JsonLdValue | undefined;
}

/** The license of every repository the project publishes. */
export const licenseUrl = "https://www.apache.org/licenses/LICENSE-2.0";

/** The GitHub organization the repositories live under. */
export const organizationGitHubUrl = "https://github.com/publira";

/**
 * The canonical URL of a page. `metadataBase` does not reach into JSON-LD, so
 * it is built from the production origin here.
 */
export const getPageUrl = (href: Page, locale: Locale) =>
  getAbsoluteUrl(getPathname({ href, locale }));

/** The `@id` of a node, as a fragment of the page that describes it. */
const getNodeId = (pageUrl: string, fragment: string) =>
  `${pageUrl}#${fragment}`;

/** One project runs the site in every locale, so its `@id` is the same. */
export const organizationId = getNodeId(
  getPageUrl("/", routing.defaultLocale),
  "organization"
);

export const getWebSiteId = (locale: Locale) =>
  getNodeId(getPageUrl("/", locale), "website");

export const getSoftwareApplicationId = (locale: Locale) =>
  getNodeId(getPageUrl("/", locale), "software");

export const getSourceCodeId = (locale: Locale, key: string) =>
  getNodeId(getPageUrl("/", locale), `source-${key}`);
