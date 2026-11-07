import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import type { ReactNode } from "react";

import { Link } from "#i18n/navigation";
import { resolveCurrentDocsPath, skipGitHubInBuild } from "#lib/docs";

// `hash` is the id rehype-slug gives the heading in the docs page.
const topics = [
  {
    guides: [
      {
        hash: "health-checks",
        key: "healthChecks",
        slug: ["operations", "monitoring"],
      },
    ],
    key: "health",
  },
  {
    guides: [
      {
        hash: "what-to-alert-on",
        key: "alerts",
        slug: ["operations", "monitoring"],
      },
    ],
    key: "observability",
  },
  {
    guides: [{ key: "backup", slug: ["deployments", "backup-and-restore"] }],
    key: "backup",
  },
  {
    guides: [{ key: "upgrading", slug: ["deployments", "upgrading"] }],
    key: "upgrading",
  },
  {
    guides: [{ key: "scaling", slug: ["deployments", "scaling-out"] }],
    key: "scaling",
  },
  {
    guides: [
      { key: "compose", slug: ["deployments", "docker-compose"] },
      { key: "kubernetes", slug: ["deployments", "kubernetes"] },
      { key: "ecs", slug: ["deployments", "ecs-fargate"] },
    ],
    key: "deployments",
  },
] as const;

const code = (chunks: ReactNode) => <code>{chunks}</code>;

type Guide = (typeof topics)[number]["guides"][number];

/** A guide's link: `/docs` until the page is known to be in the newest version. */
const withHash = (guide: Guide, path: string) =>
  "hash" in guide ? `${path}#${guide.hash}` : path;

interface GuideListProps {
  /** Each guide's link, by its key. */
  readonly hrefs?: ReadonlyMap<string, string>;
}

const GuideList = async ({ hrefs }: GuideListProps) => {
  const t = await getTranslations("operating");

  return (
    <ul className="border-border bg-border grid gap-px border-y sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <li className="bg-background px-5 py-6 sm:px-6" key={topic.key}>
          <h3 className="font-display text-foreground break-phrase text-lg">
            {t(`topics.${topic.key}.title`)}
          </h3>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {t.rich(`topics.${topic.key}.body`, { code })}
          </p>
          <ul className="mt-4 space-y-1 text-sm">
            {topic.guides.map((guide: Guide) => (
              <li key={guide.key}>
                <Link
                  className="text-primary hover:underline"
                  href={hrefs?.get(guide.key) ?? withHash(guide, "/docs")}
                >
                  {t(`guides.${guide.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};

/** The list, each guide linking its page in the newest version. */
const LinkedGuideList = async () => {
  "use cache: remote";

  if (skipGitHubInBuild()) {
    return null;
  }

  const links = await Promise.all(
    topics
      .flatMap((topic): readonly Guide[] => topic.guides)
      .map(async (guide) => {
        const { path, resolved } = await resolveCurrentDocsPath(guide.slug);

        return { href: withHash(guide, path), key: guide.key, resolved };
      })
  );

  if (links.every(({ resolved }) => resolved)) {
    cacheLife("max");
  } else {
    cacheLife("minutes");
  }

  return (
    <GuideList hrefs={new Map(links.map(({ href, key }) => [key, href]))} />
  );
};

export const OperatingGuides = () => (
  <Suspense fallback={<GuideList />}>
    <LinkedGuideList />
  </Suspense>
);
