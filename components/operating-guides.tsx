import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "#i18n/navigation";
import { getCurrentDocsPath } from "#lib/docs";

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

const getHref = async (guide: (typeof topics)[number]["guides"][number]) => {
  const path = await getCurrentDocsPath(guide.slug);

  return "hash" in guide ? `${path}#${guide.hash}` : path;
};

export const OperatingGuides = async () => {
  const [t, resolved] = await Promise.all([
    getTranslations("operating"),
    Promise.all(
      topics.map(async (topic) => ({
        guides: await Promise.all(
          topic.guides.map(async (guide) => ({
            href: await getHref(guide),
            key: guide.key,
          }))
        ),
        key: topic.key,
      }))
    ),
  ]);

  return (
    <ul className="border-border bg-border grid gap-px border-y sm:grid-cols-2 lg:grid-cols-3">
      {resolved.map((topic) => (
        <li className="bg-background px-5 py-6 sm:px-6" key={topic.key}>
          <h3 className="font-display text-foreground break-phrase text-lg">
            {t(`topics.${topic.key}.title`)}
          </h3>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {t.rich(`topics.${topic.key}.body`, { code })}
          </p>
          <ul className="mt-4 space-y-1 text-sm">
            {topic.guides.map((guide) => (
              <li key={guide.key}>
                <Link
                  className="text-primary hover:underline"
                  href={guide.href}
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
