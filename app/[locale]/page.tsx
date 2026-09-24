import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { AppScreenGroup } from "#components/app-screen-group";
import { Architecture } from "#components/architecture";
import { CodeBlock } from "#components/code-block";
import { FeatureGrid } from "#components/feature-grid";
import { Hero } from "#components/hero";
import { LibraryDetail } from "#components/library-detail";
import { RepoCard } from "#components/repo-card";
import { RequirementsTable } from "#components/requirements-table";
import { ScreenGroup } from "#components/screen-group";
import { Section } from "#components/section";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { getAlternates } from "#i18n/navigation";
import { getScreenshots } from "#lib/screenshots";

const repositories = [
  {
    href: "https://github.com/publira/publira",
    key: "publira",
    name: "publira/publira",
  },
  {
    href: "https://github.com/publira/comic-viewer",
    install: "@publira/comic-viewer",
    key: "comicViewer",
    name: "publira/comic-viewer",
  },
  {
    href: "https://github.com/publira/epub",
    install: "github.com/publira/epub",
    key: "epub",
    name: "publira/epub",
  },
] as const;

const platformFeatures = [
  "multiTenant",
  "console",
  "themes",
  "payments",
  "surfaces",
  "royalties",
  "ageRatings",
  "comments",
  "engagement",
  "notifications",
  "auditLog",
  "databaseRoles",
  "storage",
  "cache",
  "offline",
  "localization",
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

const setupCode = `# Bring up the database, cache, storage, and mail.
docker compose up -d

# Install the toolchain, migrate and seed the database,
# and upload the seed's images to object storage.
task setup

# Start the Go servers and the three web apps.
task dev`;

const secretsCode = `# Both are required, and neither has a fallback in the code.
export PUBLIRA_AUTH_SECRET="$(openssl rand -base64 32)"
export PUBLIRA_AUTH_JWT_SECRET="$(openssl rand -base64 32)"`;

const code = (chunks: ReactNode) => <code>{chunks}</code>;

export const generateMetadata = async (): Promise<Metadata> => ({
  alternates: getAlternates("/", await getLocale()),
});

export const Home = async () => {
  const t = await getTranslations();
  const screenshots = await getScreenshots();

  return (
    <>
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
            <AppScreenGroup
              app="mobile"
              description={t("screens.mobile.description")}
              screenshots={screenshots.mobile}
              title={t("screens.mobile.title")}
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
              <CodeBlock code={setupCode} label="bash" lang="shell" />
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("start.setup")}
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
          </div>
          <p className="border-border text-muted-foreground mt-10 max-w-3xl border-t pt-6 text-sm leading-relaxed">
            {t("start.status")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="bg-primary text-primary-foreground hover:bg-foreground rounded-sm px-5 py-2.5 text-sm font-medium"
              href="https://github.com/publira/publira"
              rel="noreferrer"
              target="_blank"
            >
              {t("start.guide")}
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
