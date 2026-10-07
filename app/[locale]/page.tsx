import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import NextLink from "next/link";
import type { ReactNode } from "react";

import { Architecture } from "#components/architecture";
import { CodeBlock } from "#components/code-block";
import { FeatureGrid } from "#components/feature-grid";
import { Hero } from "#components/hero";
import { JsonLd } from "#components/json-ld";
import { LibraryDetail } from "#components/library-detail";
import { RepoCard } from "#components/repo-card";
import { RequirementsTable } from "#components/requirements-table";
import { ScreenGroup } from "#components/screen-group";
import { Section } from "#components/section";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { TallScreenGroup } from "#components/tall-screen-group";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import { docsLocale, getCurrentDocsPath } from "#lib/docs";
import { getScreenshots } from "#lib/screenshots";
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
] as const;

const platformFeatures = [
  "multiTenant",
  "console",
  "themes",
  "payments",
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
  "searchEngines",
  "mobile",
  "portability",
] as const;

const comicViewerPoints = [
  "headless",
  "spreads",
  "virtualization",
  "plugins",
  "direction",
  "resolvePage",
] as const;

const epubPoints = [
  "filesystem",
  "failFast",
  "memory",
  "naming",
  "fixedLayout",
  "landmarks",
] as const;

const comicViewerCode = `import * as ComicViewer from "@publira/comic-viewer";
import "@publira/comic-viewer/core.css";

export function Reader({ pages }: ReaderProps) {
  return (
    <ComicViewer.Root
      initialReadingDirection="rtl"
      pages={pages}
    >
      <ComicViewer.Viewport />
      <ComicViewer.Toolbar />
      <ComicViewer.PageNavigation />
    </ComicViewer.Root>
  );
}`;

const epubCode = `f, err := os.Open("book.epub")
if err != nil {
	log.Fatal(err)
}
defer f.Close()

st, err := f.Stat()
if err != nil {
	log.Fatal(err)
}

opt := epub.WithCompliance(epub.LevelEBPAJ)
doc, err := epub.Decode(f, st.Size(), opt)
if err != nil {
	log.Fatal(err)
}

if err := epub.Encode(out, doc); err != nil {
	log.Fatal(err)
}`;

const buildCode = `git clone https://github.com/publira/publira.git
cd publira

docker build -f infra/docker/server/Dockerfile \\
  -t publira/publira:local .
docker build -f infra/docker/publiractl/Dockerfile \\
  -t publira/publiractl:local .
docker build -f infra/docker/web/Dockerfile \\
  --build-arg APP_NAME=web-host --build-arg PORT=3000 \\
  -t publira/web-host:local .
docker build -f infra/docker/web/Dockerfile \\
  --build-arg APP_NAME=web-admin --build-arg PORT=4000 \\
  -t publira/web-admin:local .`;

const secretsCode = `cd infra/deploy
cp .env.example .env

# Each database password goes into a URL unescaped.
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
  const [locale, t, screenshots, guideHref] = await Promise.all([
    getLocale(),
    getTranslations(),
    getScreenshots(),
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
          <div className="grid gap-6 lg:grid-cols-3">
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
          />
        </Section>

        <Section
          id="screens"
          lead={t("screens.lead")}
          title={t("screens.title")}
          tone="surface"
        >
          <div className="space-y-28">
            <ScreenGroup
              address="publisher.example"
              app="apps/web-host"
              description={t("screens.host.description")}
              screenshots={screenshots.host}
              title={t("screens.host.title")}
            />
            <ScreenGroup
              address="admin.publisher.example"
              app="apps/web-admin"
              description={t("screens.admin.description")}
              screenshots={screenshots.admin}
              title={t("screens.admin.title")}
            />
            <ScreenGroup
              address="platform.publira.example"
              app="apps/web-platform"
              description={t("screens.platform.description")}
              screenshots={screenshots.platform}
              title={t("screens.platform.title")}
            />
            <TallScreenGroup
              address={t("screens.mobile.address")}
              app="mobile"
              description={t("screens.mobile.description")}
              frame="phone"
              screenshots={screenshots.mobile}
              title={t("screens.mobile.title")}
            />
            <TallScreenGroup
              address={t("screens.mail.address")}
              app="apps/email-renderer"
              description={t("screens.mail.description")}
              frame="mail"
              screenshots={screenshots.mail}
              title={t("screens.mail.title")}
            />
          </div>
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
          id="libraries"
          lead={t("libraries.lead")}
          title={t("libraries.title")}
          tone="surface"
        >
          <div className="space-y-8">
            <LibraryDetail
              code={comicViewerCode}
              codeLabel="app/reader.tsx"
              codeLang="typescript"
              href="https://github.com/publira/comic-viewer"
              install="npm install @publira/comic-viewer"
              links={[
                {
                  href: "https://www.npmjs.com/package/@publira/comic-viewer",
                  label: t("libraries.comicViewer.links.npm"),
                },
                {
                  href: "https://demo.comic-viewer.publira.dev/",
                  label: t("libraries.comicViewer.links.demo"),
                },
                {
                  href: "https://demo-tw.comic-viewer.publira.dev/",
                  label: t("libraries.comicViewer.links.demoTailwind"),
                },
              ]}
              name="@publira/comic-viewer"
              note={t("libraries.comicViewer.note")}
              points={comicViewerPoints.map((point) =>
                t(`libraries.comicViewer.points.${point}`)
              )}
              tagline={t("libraries.comicViewer.tagline")}
            />
            <LibraryDetail
              code={epubCode}
              codeLabel="main.go"
              codeLang="go"
              href="https://github.com/publira/epub"
              install="go get github.com/publira/epub"
              links={[
                {
                  href: "https://pkg.go.dev/github.com/publira/epub",
                  label: t("libraries.epub.links.pkgGoDev"),
                },
                {
                  href: "https://epub.publira.dev/",
                  label: t("libraries.epub.links.demo"),
                },
              ]}
              name="publira/epub"
              note={t("libraries.epub.note")}
              points={epubPoints.map((point) =>
                t(`libraries.epub.points.${point}`)
              )}
              tagline={t("libraries.epub.tagline")}
            />
          </div>
        </Section>

        <Section id="start" lead={t("start.lead")} title={t("start.title")}>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="min-w-0 space-y-4">
              <CodeBlock
                code={buildCode}
                label={t("start.buildLabel")}
                lang="shell"
              />
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("start.build")}
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
            {/* The documentation is in English alone, so the link has no
                locale prefix, which would only redirect. */}
            <NextLink
              className="bg-primary text-primary-foreground hover:bg-foreground rounded-sm px-5 py-2.5 text-sm font-medium"
              href={guideHref}
              hrefLang={docsLocale}
            >
              {t("start.guide")}
            </NextLink>
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
