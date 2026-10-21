import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Architecture } from "#components/architecture";
import { CodeBlock } from "#components/code-block";
import { FeatureGrid } from "#components/feature-grid";
import { Hero } from "#components/hero";
import { JsonLd } from "#components/json-ld";
import { RepoCard } from "#components/repo-card";
import { RequirementsTable } from "#components/requirements-table";
import { ScreenGroups } from "#components/screen-groups";
import { Section } from "#components/section";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import { Link } from "#i18n/navigation";
import { getCurrentDocsPath } from "#lib/docs";
import { getLatestRelease } from "#lib/latest-release";
import {
  getPageUrl,
  getSoftwareApplicationId,
  getSourceCodeId,
  licenseUrl,
  organizationId,
} from "#lib/structured-data";

// `languages` are the ones each repository's code is written in, as GitHub
// counts them, less the build and platform glue.
const repositories = [
  {
    href: "https://github.com/publira/publira",
    key: "publira",
    languages: ["TypeScript", "Go", "Dart", "SQL"],
    name: "publira/publira",
  },
  {
    href: "https://github.com/publira/comic-viewer",
    install: "@publira/comic-viewer",
    key: "comicViewer",
    languages: ["TypeScript"],
    name: "publira/comic-viewer",
  },
  {
    href: "https://github.com/publira/epub",
    install: "github.com/publira/epub",
    key: "epub",
    languages: ["Go"],
    name: "publira/epub",
  },
  {
    href: "https://github.com/publira/messageformat-dart",
    install: "messageformat",
    key: "messageFormat",
    languages: ["Dart"],
    name: "publira/messageformat-dart",
  },
] as const;

const platformFeatures = [
  "multiTenant",
  "console",
  "themes",
  "payments",
  "freeReading",
  "signIn",
  "surfaces",
  "royalties",
  "ageRatings",
  "comments",
  "engagement",
  "notifications",
  "mail",
  "auditLog",
  "databaseRoles",
  "storage",
  "cache",
  "offline",
  "localization",
  "search",
  "searchEngines",
  "mobile",
  "portability",
] as const;

/**
 * The download of `version`'s Compose archive, or of a placeholder while it
 * cannot be named.
 */
const getReleaseCode = (version: string) => `PUBLIRA_VERSION=${version}
curl -fsSLO \\
  https://github.com/publira/publira/releases/download/v$PUBLIRA_VERSION/publira-deploy-$PUBLIRA_VERSION.tar.gz
tar -xzf publira-deploy-$PUBLIRA_VERSION.tar.gz
cd publira-deploy-$PUBLIRA_VERSION

# Write .env from .env.example, with every secret generated
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD":/work -w /work \\
  ghcr.io/publira/publiractl:$PUBLIRA_VERSION env generate`;

const code = (chunks: ReactNode) => <code>{chunks}</code>;
const paragraph = (chunks: ReactNode) => <p>{chunks}</p>;

export const generateMetadata = async (): Promise<Metadata> => {
  const [locale, t] = await Promise.all([getLocale(), getTranslations()]);

  return {
    alternates: getAlternates("/", locale),
    openGraph: getOpenGraph("/", locale, {
      siteName: t("site.name"),
      title: t("metadata.title", { name: t("site.name") }),
    }),
  };
};

export const Home = async () => {
  const [locale, t, guideHref, release] = await Promise.all([
    getLocale(),
    getTranslations(),
    getCurrentDocsPath(["deployments"]),
    getLatestRelease(),
  ]);
  const version = release ?? "<version>";
  const softwareApplicationId = getSoftwareApplicationId(locale);

  return (
    <>
      <JsonLd
        graph={[
          {
            "@id": softwareApplicationId,
            "@type": "SoftwareApplication",
            applicationCategory: "BusinessApplication",
            author: { "@id": organizationId },
            description: t("hero.lead"),
            license: licenseUrl,
            name: t("site.name"),
            publisher: { "@id": organizationId },
            url: getPageUrl("/", locale),
          },
          ...repositories.map((repository) => ({
            "@id": getSourceCodeId(locale, repository.key),
            "@type": "SoftwareSourceCode",
            author: { "@id": organizationId },
            codeRepository: repository.href,
            description: t(
              `projects.repositories.${repository.key}.description`
            ),
            license: licenseUrl,
            name: repository.name,
            programmingLanguage: repository.languages,
            targetProduct:
              repository.key === "publira"
                ? { "@id": softwareApplicationId }
                : undefined,
            url: repository.href,
          })),
        ]}
      />
      <SiteHeader />
      <main>
        <Hero />

        <Section
          id="projects"
          lead={t("projects.lead")}
          title={t("projects.title")}
          tone="surface"
        >
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
            {repositories.map((repository) => (
              <RepoCard
                description={t(
                  `projects.repositories.${repository.key}.description`
                )}
                href={repository.href}
                install={
                  "install" in repository ? repository.install : undefined
                }
                key={repository.key}
                language={t(`projects.repositories.${repository.key}.language`)}
                name={repository.name}
                role={t(`projects.repositories.${repository.key}.role`)}
              />
            ))}
          </div>
          <Link
            className="border-primary text-primary hover:bg-accent mt-10 inline-block rounded-sm border px-5 py-2.5 text-sm font-medium"
            href="/libraries"
          >
            {t("projects.libraries")}
          </Link>
        </Section>

        <Section
          id="platform"
          lead={t("platform.lead")}
          title={t("platform.title")}
        >
          <FeatureGrid
            features={platformFeatures.map((feature) => ({
              body: t(`platform.features.${feature}.body`),
              title: t(`platform.features.${feature}.title`),
            }))}
            showAllLabel={t("platform.showAll")}
          />
        </Section>

        <Section
          id="screens"
          lead={t("screens.lead")}
          title={t("screens.title")}
          tone="surface"
        >
          <ScreenGroups featured />
        </Section>

        <Section
          id="architecture"
          lead={t("architecture.lead")}
          title={t("architecture.title")}
        >
          <div className="space-y-8">
            <Architecture />
            <RequirementsTable />
          </div>
        </Section>

        <Section
          id="start"
          lead={t("start.lead")}
          title={t("start.title")}
          tone="surface"
        >
          <div className="max-w-3xl space-y-4">
            <CodeBlock
              code={getReleaseCode(version)}
              label={t("start.releaseLabel")}
              lang="shell"
            />
            <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
              {t.rich("start.release", { code, p: paragraph, version })}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="bg-primary text-primary-foreground hover:bg-foreground rounded-sm px-5 py-2.5 text-sm font-medium"
              href={guideHref}
            >
              {t("start.guide")}
            </Link>
            <a
              className="border-primary text-primary hover:bg-accent rounded-sm border px-5 py-2.5 text-sm font-medium"
              href={
                release
                  ? `https://github.com/publira/publira/releases/tag/v${release}`
                  : "https://github.com/publira/publira/releases/latest"
              }
              rel="noreferrer"
              target="_blank"
            >
              {t("start.releaseNotes", { version: release ?? "none" })}
            </a>
            <a
              className="border-primary text-primary hover:bg-accent rounded-sm border px-5 py-2.5 text-sm font-medium"
              href="https://github.com/publira/publira/blob/main/CONTRIBUTING.md"
              rel="noreferrer"
              target="_blank"
            >
              {t("start.contributing")}
            </a>
          </div>
        </Section>
      </main>
      <SiteFooter note={t("footer.seedData")} />
    </>
  );
};

export default Home;
