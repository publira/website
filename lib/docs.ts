import path from "node:path";
import { setTimeout } from "node:timers/promises";

import { imageSize } from "image-size";
import type { Locale } from "next-intl";
import { cacheLife, cacheTag } from "next/cache";
import { parse } from "yaml";

import { getPathname } from "#i18n/navigation";
import { routing } from "#i18n/routing";
import { getGitHubToken } from "#lib/github-app";

/** The repository whose `docs/<locale>/` the documentation is read from. */
export const docsRepository = "publira/publira";

const docsRoot = "docs";

/**
 * The locale the others are translated from. A release is documented when its
 * tree exists, and a page another locale lacks is read in it.
 */
export const docsSourceLocale = routing.defaultLocale;

/** The branch served as the `next` version. */
const nextBranch = "main";

export const nextVersion = "next";

/** The cache tags the webhook revalidates. */
export const docsCacheTags = {
  next: "docs-next",
  releases: "docs-releases",
} as const;

/** The image types the contract allows, by extension. */
const imageTypes = new Map([
  [".avif", "image/avif"],
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

interface DocsVersion {
  /** `next`, or `vX.Y`: the URL segment. */
  readonly name: string;
  /** The branch or tag the version's pages are read from. */
  readonly ref: string;
}

interface TreeEntry {
  /** The path below `docs/`, or below `docs/<locale>/` once it is taken. */
  readonly path: string;
  readonly sha: string;
}

interface Frontmatter {
  readonly description: string;
  /** `YYYY-MM-DD`. */
  readonly published: string;
  readonly title: string;
  /** `YYYY-MM-DD`. */
  readonly updated?: string;
}

export interface DocsPage extends Frontmatter, TreeEntry {
  /** The `<n>` of each segment of `path`, which orders the navigation. */
  readonly order: readonly number[];
  /** The URL segments below the version: `["deployments", "overview"]`. */
  readonly slug: readonly string[];
}

export interface DocsImage extends TreeEntry {
  /** The URL segments below the version, ending in the file's name. */
  readonly slug: readonly string[];
  readonly type: string;
}

export interface DocsTree {
  readonly images: readonly DocsImage[];
  readonly locale: Locale;
  /** Every page, in navigation order. */
  readonly pages: readonly DocsPage[];
}

// GitHub allows 100 concurrent requests, which parallel build workers share.
const maxRequests = 10;
let activeRequests = 0;
const waitingRequests: ((value: null) => void)[] = [];

const acquireRequest = async () => {
  if (activeRequests < maxRequests) {
    activeRequests += 1;
    return;
  }
  const { promise, resolve } = Promise.withResolvers<null>();
  waitingRequests.push(resolve);
  await promise;
};

/** Hands the slot to the next waiting request, if any. */
const releaseRequest = () => {
  const next = waitingRequests.shift();
  if (!next) {
    activeRequests -= 1;
    return;
  }
  return next(null);
};

const fetchGitHub = async (
  endpoint: string,
  accept = "application/vnd.github+json",
  attempt = 0
): Promise<Response> => {
  const headers = new Headers({
    accept,
    "x-github-api-version": "2022-11-28",
  });
  // Without a token, GitHub allows 60 requests an hour, which a build spends.
  const token = await getGitHubToken(docsRepository);
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  await acquireRequest();
  let response: Response;
  try {
    response = await fetch(
      `https://api.github.com/repos/${docsRepository}/${endpoint}`,
      { headers }
    );
  } finally {
    releaseRequest();
  }

  // A cold build's burst of blobs meets the secondary rate limit, which names
  // a wait. Each retry waits longer, so the burst spreads out.
  const retryAfter = Number(response.headers.get("retry-after"));
  if (retryAfter > 0 && attempt < 4) {
    await setTimeout(retryAfter * 1000 * 2 ** attempt);
    return fetchGitHub(endpoint, accept, attempt + 1);
  }
  return response;
};

const fetchGitHubOk = async (endpoint: string, accept?: string) => {
  const response = await fetchGitHub(endpoint, accept);
  if (!response.ok) {
    throw new Error(`GitHub responded to ${endpoint} with ${response.status}`);
  }
  return response;
};

const getRefTag = (ref: string) =>
  ref === nextBranch ? docsCacheTags.next : docsCacheTags.releases;

/** The files under `docs/` at `ref`, or `null` when it has none. */
const getTreeEntries = async (
  ref: string
): Promise<readonly TreeEntry[] | null> => {
  "use cache";
  cacheLife("max");
  cacheTag(getRefTag(ref));

  const treeish = encodeURIComponent(`${ref}:${docsRoot}`);
  const response = await fetchGitHub(`git/trees/${treeish}?recursive=1`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `GitHub responded to the tree of ${ref} with ${response.status}`
    );
  }

  // SAFETY: the shape GitHub documents for "Get a tree".
  const { tree, truncated } = (await response.json()) as {
    readonly tree: readonly { path: string; sha: string; type: string }[];
    readonly truncated: boolean;
  };
  if (truncated) {
    throw new Error(`GitHub truncated the tree of ${docsRoot} at ${ref}`);
  }

  return tree.flatMap(({ path: entry, sha, type }) =>
    type === "blob" ? [{ path: entry, sha }] : []
  );
};

/** The files under `docs/<locale>/` at `ref`, or `null` when it has none. */
const getLocaleEntries = async (
  ref: string,
  locale: Locale
): Promise<readonly TreeEntry[] | null> => {
  const prefix = `${locale}/`;
  const entries = await getTreeEntries(ref);
  const localeEntries = entries?.flatMap(({ path: entry, sha }) =>
    entry.startsWith(prefix) ? [{ path: entry.slice(prefix.length), sha }] : []
  );
  return localeEntries?.length ? localeEntries : null;
};

/** A file's content. A blob never changes, so it is cached by its hash alone. */
export const getBlob = async (sha: string) => {
  "use cache";
  cacheLife("max");

  const response = await fetchGitHubOk(
    `git/blobs/${sha}`,
    "application/vnd.github.raw+json"
  );
  return new Uint8Array(await response.arrayBuffer());
};

/** Compares number by number, a prefix first. */
const compareNumbers = (a: readonly number[], b: readonly number[]): number => {
  const [first, ...rest] = a;
  const [other, ...otherRest] = b;
  if (first === undefined || other === undefined) {
    return a.length - b.length;
  }
  return first === other ? compareNumbers(rest, otherRest) : first - other;
};

const tagPrefix = "refs/tags/";
const releaseTag =
  /^refs\/tags\/v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;

/** The first of `tags` whose tree has the source locale's docs. */
const findDocumentedTag = async (
  tags: readonly string[]
): Promise<string | undefined> => {
  const [tag, ...older] = tags;
  if (tag === undefined || (await getLocaleEntries(tag, docsSourceLocale))) {
    return tag;
  }
  return findDocumentedTag(older);
};

/**
 * The releases, newest first: the highest `vX.Y.Z` tag of each `X.Y` whose
 * tree has the source locale's docs. A pre-release tag is not a release.
 */
const getReleases = async (): Promise<readonly DocsVersion[]> => {
  "use cache";
  cacheLife("max");
  cacheTag(docsCacheTags.releases);

  const response = await fetchGitHubOk("git/matching-refs/tags/v");
  // SAFETY: the shape GitHub documents for "List matching references".
  const refs = (await response.json()) as readonly { ref: string }[];

  // The tags of each minor version, newest first, highest patch first.
  const minors = new Map<string, string[]>();
  const tags = refs
    .flatMap(({ ref }) => {
      if (!releaseTag.test(ref)) {
        return [];
      }
      const tag = ref.slice(tagPrefix.length);
      const numbers = tag.slice(1).split(".").map(Number);
      return [{ name: `v${numbers.slice(0, 2).join(".")}`, numbers, tag }];
    })
    .toSorted((a, b) => compareNumbers(b.numbers, a.numbers));
  for (const { name, tag } of tags) {
    minors.set(name, [...(minors.get(name) ?? []), tag]);
  }

  const documented = await Promise.all(
    [...minors].map(async ([name, candidates]) => ({
      name,
      ref: await findDocumentedTag(candidates),
    }))
  );
  return documented.flatMap(({ name, ref }) => (ref ? [{ name, ref }] : []));
};

/** `next`, then the releases, newest first. */
export const getDocsVersions = async (): Promise<readonly DocsVersion[]> => [
  { name: nextVersion, ref: nextBranch },
  ...(await getReleases()),
];

/** The newest release, or `next` while there is none. */
export const getCurrentVersion = async () => {
  const [newest] = await getReleases();
  return newest?.name ?? nextVersion;
};

const numberedName = /^[1-9]\d*-[a-z\d]+(?:-[a-z\d]+)*$/u;

/** A `<n>-<slug>` name, or `null` for one the contract does not allow. */
const parseName = (name: string) => {
  if (!numberedName.test(name)) {
    return null;
  }
  const separator = name.indexOf("-");
  return {
    order: Number(name.slice(0, separator)),
    slug: name.slice(separator + 1),
  };
};

/** A path's directories as `<n>-<slug>` names, and its file name. */
const parsePath = (entry: string) => {
  const directories = path.posix.dirname(entry).split("/");
  const parsed = directories.flatMap((name) =>
    name === "." ? [] : [parseName(name)]
  );
  return {
    directories: parsed.every((name) => name !== null) ? parsed : null,
    file: path.posix.basename(entry),
  };
};

const parseFrontmatter = (source: string) => {
  const [first, ...lines] = source.split(/\r?\n/u);
  const end = lines.indexOf("---");
  const yaml = first === "---" && end !== -1 ? lines.slice(0, end) : [];
  // SAFETY: `scripts/check-docs.ts` in publira/publira's CI holds every page
  // to these keys, and YAML 1.2 reads a `YYYY-MM-DD` date as a string.
  return parse(yaml.join("\n")) as Frontmatter;
};

const decoder = new TextDecoder();

const toPage = async ({ path: entry, sha }: TreeEntry) => {
  const { directories, file } = parsePath(entry);
  const name =
    file === "index.md" ? null : parseName(path.posix.parse(file).name);
  if (!directories || (file !== "index.md" && !name)) {
    return [];
  }

  const names = name ? [...directories, name] : directories;
  const order = names.map((segment) => segment.order);
  return [
    {
      ...parseFrontmatter(decoder.decode(await getBlob(sha))),
      // A directory's own page comes before the pages inside it.
      order: name ? order : [...order, 0],
      path: entry,
      sha,
      slug: names.map((segment) => segment.slug),
    },
  ];
};

const toImage = ({ path: entry, sha }: TreeEntry) => {
  const { directories, file } = parsePath(entry);
  const type = imageTypes.get(path.posix.extname(file).toLowerCase());
  if (!(directories && type)) {
    return [];
  }

  return [
    {
      path: entry,
      sha,
      slug: [...directories.map((segment) => segment.slug), file],
      type,
    },
  ];
};

/**
 * The image of a locale at `slug` whose blob is `sha` in any served version. A
 * page cached from before the docs changed keeps its images while some version
 * has them.
 */
export const findDocsImage = async (
  locale: Locale,
  sha: string,
  slug: readonly string[]
) => {
  const versions = await getDocsVersions();
  const trees = await Promise.all(
    versions.map(({ ref }) => getLocaleEntries(ref, locale))
  );
  return trees
    .flatMap((entries) => entries?.flatMap(toImage) ?? [])
    .find(
      (image) => image.sha === sha && image.slug.join("/") === slug.join("/")
    );
};

/**
 * A version's pages and images in a locale, or `null` for a version that is
 * not served or a locale without a tree at it.
 */
export const getDocsTree = async (
  version: string,
  locale: Locale
): Promise<DocsTree | null> => {
  "use cache";
  cacheLife("max");

  const versions = await getDocsVersions();
  const ref = versions.find(({ name }) => name === version)?.ref;
  if (!ref) {
    return null;
  }
  cacheTag(getRefTag(ref));

  const entries = await getLocaleEntries(ref, locale);
  if (!entries) {
    return null;
  }
  const pages = await Promise.all(
    entries.flatMap((entry) =>
      entry.path.endsWith(".md") ? [toPage(entry)] : []
    )
  );

  return {
    images: entries.flatMap(toImage),
    locale,
    pages: pages.flat().toSorted((a, b) => compareNumbers(a.order, b.order)),
  };
};

/** Every version's pages in a locale as route params. */
export const getDocsPageParams = async (locale: Locale) => {
  const versions = await getDocsVersions();
  const trees = await Promise.all(
    versions.map(async ({ name }) => ({
      name,
      tree: await getDocsTree(name, locale),
    }))
  );
  return trees.flatMap(({ name, tree }) =>
    (tree?.pages ?? []).map(({ slug }) => ({ slug: [...slug], version: name }))
  );
};

/**
 * The URL of a page, or of a version's root with no slug, without the locale
 * that `Link` adds.
 */
export const getDocsPath = (version: string, slug: readonly string[] = []) =>
  ["/docs", version, ...slug].join("/");

/** The URL of a page in a locale. */
export const getLocalizedDocsPath = (
  locale: Locale,
  version: string,
  slug: readonly string[] = []
) => getPathname({ href: getDocsPath(version, slug), locale });

/**
 * The URL that names an image's blob, which the browser and the CDN keep for
 * good. Every version shares it while the image is unchanged.
 */
const getDocsImagePath = (locale: Locale, { sha, slug }: DocsImage) =>
  getPathname({ href: ["/docs/images", sha, ...slug].join("/"), locale });

export const findPage = (tree: DocsTree, slug: readonly string[]) =>
  tree.pages.find((page) => page.slug.join("/") === slug.join("/"));

/** The locales whose tree has the page at `slug` in a version. */
export const getDocsPageLocales = async (
  version: string,
  slug: readonly string[]
) => {
  const trees = await Promise.all(
    routing.locales.map(async (locale) => ({
      locale,
      tree: await getDocsTree(version, locale),
    }))
  );
  return trees.flatMap(({ locale, tree }) =>
    tree && findPage(tree, slug) ? [locale] : []
  );
};

/**
 * The URL of a page in the newest version, or of `/docs` when that version
 * has no page at `slug`, as after a page is renamed.
 */
export const getCurrentDocsPath = async (slug: readonly string[]) => {
  const version = await getCurrentVersion();
  const tree = await getDocsTree(version, docsSourceLocale);
  return tree && findPage(tree, slug) ? getDocsPath(version, slug) : "/docs";
};

const externalUrl = /^(?:[a-z][a-z\d+.-]*:|\/|#|\?)/iu;

/**
 * The path in the tree that a relative URL in the page at `from` names, and
 * the URL's query or fragment, or `null` for any other URL.
 */
const resolveEntry = (from: string, url: string) => {
  if (externalUrl.test(url)) {
    return null;
  }

  const end = url.search(/[?#]/u);
  const target = end === -1 ? url : url.slice(0, end);
  try {
    return {
      entry: path.posix.join(path.posix.dirname(from), decodeURI(target)),
      suffix: end === -1 ? "" : url.slice(end),
    };
  } catch {
    return null;
  }
};

/**
 * Where a relative URL in the page at `from` leads on the site: a `.md` file
 * to its page, an image to the URL that names its blob, both in the tree's
 * locale. Any other URL is left alone.
 */
export const resolveDocsUrl = (
  tree: DocsTree,
  version: string,
  from: string,
  url: string
) => {
  const resolved = resolveEntry(from, url);
  if (!resolved) {
    return url;
  }

  // The query or fragment is kept: a page's heading, or an SVG's view.
  const { entry, suffix } = resolved;
  const page = tree.pages.find((candidate) => candidate.path === entry);
  if (page) {
    return `${getLocalizedDocsPath(tree.locale, version, page.slug)}${suffix}`;
  }
  const image = tree.images.find((candidate) => candidate.path === entry);
  return image ? `${getDocsImagePath(tree.locale, image)}${suffix}` : url;
};

/** The image of the tree that a relative URL in the page at `from` names. */
export const resolveDocsImage = (tree: DocsTree, from: string, url: string) => {
  const entry = resolveEntry(from, url)?.entry;
  return tree.images.find((candidate) => candidate.path === entry);
};

/** An image's intrinsic size, or `null` when its file cannot be parsed. */
export const getDocsImageSize = async ({ sha }: DocsImage) => {
  // A failed fetch throws rather than leave a cached page without the size.
  const blob = await getBlob(sha);
  try {
    const { height, orientation = 1, width } = imageSize(blob);
    // EXIF orientations 5 to 8 turn the image a quarter, as browsers show it.
    return orientation >= 5
      ? { height: width, width: height }
      : { height, width };
  } catch {
    return null;
  }
};
