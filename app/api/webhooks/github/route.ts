import { createHmac, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

import { docsCacheTags, docsRepository } from "#lib/docs";

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

/** The cache tags a push to the documentation's repository makes stale. */
const getStaleTags = (event: PushEvent) => {
  if (event.repository?.full_name !== docsRepository) {
    return [];
  }
  if (event.ref === "refs/heads/main") {
    const touchesDocs = event.commits?.some((commit) =>
      [
        ...(commit.added ?? []),
        ...(commit.modified ?? []),
        ...(commit.removed ?? []),
      ].some((path) => path.startsWith("docs/"))
    );
    return touchesDocs ? [docsCacheTags.next] : [];
  }
  if (
    event.ref?.startsWith("refs/tags/v") &&
    (event.created || event.deleted)
  ) {
    return [docsCacheTags.releases];
  }
  return [];
};

/** The `push` webhook of publira/publira, which keeps `/docs` current. */
const receivePush = async (request: Request) => {
  const body = await request.text();
  if (!isSigned(body, request.headers.get("x-hub-signature-256"))) {
    return new Response(null, { status: 401 });
  }
  if (request.headers.get("x-github-event") !== "push") {
    return new Response(null, { status: 204 });
  }

  // SAFETY: the signature shows GitHub sent the body, as a `push` payload.
  const tags = getStaleTags(JSON.parse(body) as PushEvent);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
  return Response.json({ revalidated: tags });
};

export { receivePush as POST };
