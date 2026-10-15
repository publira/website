import { cacheLife, cacheTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";

import { docsRepository, fetchGitHub } from "#lib/docs";

/** The cache tag the webhook revalidates when a Release changes. */
export const latestReleaseCacheTag = "latest-release";

const releaseTag = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;

/**
 * The version of publira/publira's newest published Release, without the `v`,
 * or `null` while there is none. A tag alone is not enough: its images are
 * pushed before the Release is published.
 */
const readLatestRelease = async () => {
  "use cache: remote";
  cacheLife("max");
  cacheTag(latestReleaseCacheTag);

  const response = await fetchGitHub("releases/latest");
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `GitHub responded to the latest Release with ${response.status}`
    );
  }

  // SAFETY: the shape GitHub documents for "Get the latest release".
  const { tag_name: tag } = (await response.json()) as {
    readonly tag_name: string;
  };
  if (!releaseTag.test(tag)) {
    throw new Error(
      `The latest Release of ${docsRepository} is tagged ${tag}, not vX.Y.Z`
    );
  }
  return tag.slice(1);
};

/**
 * No version, while GitHub cannot be read. Its short life makes the page that
 * renders it ask GitHub again within minutes.
 */
// oxlint-disable-next-line require-await -- "use cache" takes only async functions.
const getUnresolvedRelease = async () => {
  "use cache";
  cacheLife("minutes");
  return null;
};

/** The newest release's version, or `null` when it cannot be named. */
export const getLatestRelease = async (): Promise<string | null> => {
  try {
    return await readLatestRelease();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Reading the latest Release:", error);
    return getUnresolvedRelease();
  }
};
