import { createHmac, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

import {
  appManifestSchemaCacheTag,
  appManifestSchemaRoot,
} from "#lib/app-manifest-schema";
import { docsCacheTags, docsRepository } from "#lib/docs";
import { latestReleaseCacheTag } from "#lib/latest-release";

interface PushEvent {
  readonly commits?: readonly {
    readonly added?: readonly string[];
    readonly modified?: readonly string[];
    readonly removed?: readonly string[];
  }[];
  readonly created?: boolean;
  readonly deleted?: boolean;
  readonly ref?: string;
  readonly repository?: { readonly full_name?: string };
}

interface ReleaseEvent {
  readonly action?: string;
  readonly repository?: { readonly full_name?: string };
}

/**
 * The `release` actions that can change which Release is the latest, which is
 * never a prerelease.
 */
const releaseActions = new Set([
  "deleted",
  "edited",
  "prereleased",
  "published",
  "released",
  "unpublished",
]);

const isSigned = (body: string, signature: string | null) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!(secret && signature)) {
    return false;
  }

  const expected = Buffer.from(
    `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`
  );

  const actual = Buffer.from(signature);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

/** The cache tag of what `main` serves from each directory. */
const mainPathTags = [
  ["docs/", docsCacheTags.next],
  [appManifestSchemaRoot, appManifestSchemaCacheTag],
] as const;

/** The cache tags a push to the documentation's repository makes stale. */
const getPushStaleTags = (event: PushEvent) => {
  if (event.repository?.full_name !== docsRepository) {
    return [];
  }

  if (event.ref === "refs/heads/main") {
    const paths = (event.commits ?? []).flatMap((commit) => [
      ...(commit.added ?? []),
      ...(commit.modified ?? []),
      ...(commit.removed ?? []),
    ]);

    return mainPathTags.flatMap(([root, tag]) =>
      paths.some((path) => path.startsWith(root)) ? [tag] : []
    );
  }

  if (
    event.ref?.startsWith("refs/tags/v") &&
    (event.created || event.deleted)
  ) {
    return [docsCacheTags.releases];
  }

  return [];
};

/** The cache tags a change to a Release of the repository makes stale. */
const getReleaseStaleTags = (event: ReleaseEvent) =>
  event.repository?.full_name === docsRepository &&
  event.action &&
  releaseActions.has(event.action)
    ? [latestReleaseCacheTag]
    : [];

/**
 * The `push` and `release` webhooks of publira/publira, which keep `/docs`,
 * the app manifest's schema, and the home page's release current.
 */
const receiveEvent = async (request: Request) => {
  const body = await request.text();

  if (!isSigned(body, request.headers.get("x-hub-signature-256"))) {
    return new Response(null, { status: 401 });
  }

  const event = request.headers.get("x-github-event");

  if (event !== "push" && event !== "release") {
    return new Response(null, { status: 204 });
  }

  // SAFETY: the signature shows GitHub sent the body, as a payload of `event`.
  const tags =
    event === "push"
      ? getPushStaleTags(JSON.parse(body) as PushEvent)
      : getReleaseStaleTags(JSON.parse(body) as ReleaseEvent);

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return Response.json({ revalidated: tags });
};

export { receiveEvent as POST };
