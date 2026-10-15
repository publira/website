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
import { release } from "#lib/release";
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

const releaseCode = `git clone --branch v${release} https://github.com/publira/publira.git
cd publira/infra/deploy
cp .env.example .env
chmod 600 .env

# In .env, the version of the release's images on ghcr.io/publira
# PUBLIRA_IMAGE_TAG=${release}`;

const secretsCode = `# Each database password goes into a URL unescaped.
openssl rand -hex 32

# PUBLIRA_SECRET_ENCRYPTION_KEYS, with k1 as its primary key ID
echo "k1:$(openssl rand -base64 32)"

# The access token key, each app's session key, and the tokens
openssl rand -base64 32`;

const serviceCode = `docker compose run --rm publiractl db migrate
docker compose run --rm publiractl db roles \\
  --public-password-file /run/secrets/public-db-password \\
  --admin-password-file /run/secrets/admin-db-password \\
  --platform-password-file /run/secrets/platform-db-password \\
  --outbox-password-file /run/secrets/outbox-db-password \\
  --ticker-password-file /run/secrets/ticker-db-password \\
  --content-stats-password-file /run/secrets/content-stats-db-password
docker compose up -d

# The bucket, created in the bundled RustFS with its own credential.
docker compose exec rustfs sh -c \\
  'curl -fsS -X PUT --aws-sigv4 aws:amz:us-east-1:s3 --user "$RUSTFS_ACCESS_KEY:$RUSTFS_SECRET_KEY" http://localhost:9000/publira'

# Save the object store, the SMTP relay, and the first tenant and its admin.
docker compose run --rm publiractl setup \\
  --bucket publira --region us-east-1 \\
  --endpoint http://rustfs:9000 --force-path-style \\
  --access-key-id <PUBLIRA_RUSTFS_ACCESS_KEY> \\
  --secret-access-key-file /run/secrets/rustfs-secret-key`;

const code = (chunks: ReactNode) => <code>{chunks}</code>;

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
  const [locale, t, guideHref] = await Promise.all([
    getLocale(),
    getTranslations(),
    getCurrentDocsPath(["deployments"]),
  ]);
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
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="min-w-0 space-y-4">
              <CodeBlock
                code={releaseCode}
                label={t("start.releaseLabel")}
                lang="shell"
              />
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t.rich("start.release", { code, version: release })}
              </p>
            </div>
            <div className="min-w-0 space-y-4">
              <CodeBlock
                code={secretsCode}
                label={t("start.secretsLabel")}
                lang="shell"
              />
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t.rich("start.secrets", { code })}
              </p>
            </div>
            <div className="min-w-0 space-y-4 lg:col-span-2">
              <CodeBlock
                code={serviceCode}
                label={t("start.serviceLabel")}
                lang="shell"
              />
              <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
                {t.rich("start.service", { code })}
              </p>
            </div>
          </div>
          <p className="border-border text-muted-foreground mt-10 max-w-3xl border-t pt-6 text-sm leading-relaxed">
            {t("start.status")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="bg-primary text-primary-foreground hover:bg-foreground rounded-sm px-5 py-2.5 text-sm font-medium"
              href={guideHref}
            >
              {t("start.guide")}
            </Link>
            <a
              className="border-primary text-primary hover:bg-accent rounded-sm border px-5 py-2.5 text-sm font-medium"
              href={`https://github.com/publira/publira/releases/tag/v${release}`}
              rel="noreferrer"
              target="_blank"
            >
              {t("start.releaseNotes", { version: release })}
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
