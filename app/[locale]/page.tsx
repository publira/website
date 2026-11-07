import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { Architecture } from "#components/architecture";
import { FeatureGrid } from "#components/feature-grid";
import { GetStarted } from "#components/get-started";
import { Hero } from "#components/hero";
import { JsonLd } from "#components/json-ld";
import { OperatingGuides } from "#components/operating-guides";
import { RepoCard } from "#components/repo-card";
import { RequirementsTable } from "#components/requirements-table";
import { ScreenGroups } from "#components/screen-groups";
import { Section } from "#components/section";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import { Link } from "#i18n/navigation";
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
  "plansAndCoins",
  "freeReading",
  "royalties",
  "reports",
  "signIn",
  "surfaces",
  "ageRatings",
  "comments",
  "notifications",
  "mail",
  "readerData",
  "localization",
  "engagement",
  "auditLog",
  "databaseRoles",
  "storage",
  "cache",
  "offline",
  "search",
  "searchEngines",
  "analytics",
  "mobile",
  "portability",
] as const;

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
  const [locale, t] = await Promise.all([getLocale(), getTranslations()]);
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
          id="operating"
          lead={t("operating.lead")}
          title={t("operating.title")}
          tone="surface"
        >
          <OperatingGuides />
        </Section>

        <Section id="start" lead={t("start.lead")} title={t("start.title")}>
          <GetStarted />
        </Section>
      </main>
      <SiteFooter note={t("footer.seedData")} />
    </>
  );
};

export default Home;
