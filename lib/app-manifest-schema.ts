import { cacheLife, cacheTag } from "next/cache";

import { fetchGitHub } from "#lib/docs";

/** The directory of publira/publira that holds the schemas. */
export const appManifestSchemaRoot = "mobile/config/";

/** The cache tag the webhook revalidates when the schemas change on `main`. */
export const appManifestSchemaCacheTag = "app-manifest-schema";

/** A name the route serves: `v<schemaVersion>.json`. */
const schemaName = /^v[1-9]\d*\.json$/u;

/**
 * The schema of the app manifest's format at `name`, such as `v1.json`, as
 * `main` of publira/publira has it, or `null` when it has none.
 */
export const getAppManifestSchema = async (name: string) => {
  // Remote, so every instance does not ask GitHub for the same file.
  "use cache: remote";
  cacheLife("max");
  cacheTag(appManifestSchemaCacheTag);

  if (!schemaName.test(name)) {
    return null;
  }
  const file = `${appManifestSchemaRoot}app.schema.${name}`;
  const response = await fetchGitHub(
    `contents/${file}?ref=main`,
    "application/vnd.github.raw+json"
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GitHub responded to ${file} with ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};
