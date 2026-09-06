import { Architecture } from "#components/architecture";
import { CodeBlock } from "#components/code-block";
import { FeatureGrid } from "#components/feature-grid";
import type { Feature } from "#components/feature-grid";
import { Hero } from "#components/hero";
import { LibraryDetail } from "#components/library-detail";
import { RepoCard } from "#components/repo-card";
import { RequirementsTable } from "#components/requirements-table";
import { ScreenGroup } from "#components/screen-group";
import { Section } from "#components/section";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import {
  adminScreenshots,
  hostScreenshots,
  platformScreenshots,
} from "#lib/screenshots";

const repositories = [
  {
    description:
      "The platform itself: three Next.js apps, five Go services, a Flutter mobile client, and the Compose stack that runs them all locally.",
    href: "https://github.com/publira/publira",
    language: "TypeScript · Go",
    name: "publira/publira",
    role: "The platform",
  },
  {
    description:
      "The React comic viewer behind the episode screen. Headless by design, so the surrounding product supplies every pixel of the UI and the data pipeline.",
    href: "https://github.com/publira/comic-viewer",
    install: "@publira/comic-viewer",
    language: "TypeScript",
    name: "publira/comic-viewer",
    role: "The reader",
  },
  {
    description:
      "A Go library for decoding, encoding, and validating EPUB 3, built around io.ReaderAt so a publication never has to touch the filesystem.",
    href: "https://github.com/publira/epub",
    install: "github.com/publira/epub",
    language: "Go",
    name: "publira/epub",
    role: "The format",
  },
];

const platformFeatures: readonly Feature[] = [
  {
    body: "Every publisher runs under its own brand and domain, while a separate platform console manages tenant status, plans, and contacts across the whole install.",
    title: "Multi-tenant from the ground up",
  },
  {
    body: "The public, admin, and platform servers each connect to PostgreSQL as their own role, so the reader-facing site cannot reach what only an operator should see.",
    title: "Role-separated database access",
  },
  {
    body: "Brand colors are edited against a live preview built from the same parts as the public site, and the site keeps its current colors until the theme is saved.",
    title: "Themes with a real preview",
  },
  {
    body: "Who did what, when, and how it turned out — filtered by period, action, or actor, with dates read as calendar days in the tenant's own time zone.",
    title: "An audit log per tenant",
  },
  {
    body: "Episode images upload to S3-compatible storage and are delivered by a dedicated image server, taking the same path locally as they do in production.",
    title: "Object storage and image delivery",
  },
  {
    body: '"use cache", ISR, route handlers, fetch, and the next/image results are all shared through Redis, so a deployment can run more than one instance.',
    title: "A cache built for many instances",
  },
  {
    body: "Series, episodes, labels, authors, pages, announcements, and limited-access tickets are managed from one console, with a queue of everything awaiting release.",
    title: "One console for the whole catalog",
  },
  {
    body: "The reader site and both consoles ship a language switcher, and the tenant's time zone governs how its own records are read.",
    title: "Localized end to end",
  },
  {
    body: "Apache-2.0, ordinary infrastructure underneath, and no managed service in the way — portability and freedom from lock-in are the point, not a side effect.",
    title: "Yours to run anywhere",
  },
];

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

const setupCode = `# Install dependencies and initialize the database.
task setup

# Bring up the database, cache, storage, and mail.
docker compose up -d

# Apply the migrations and the baseline seed.
task db:setup`;

const secretsCode = `# Both are required, and neither has a fallback in the code.
export PUBLIRA_AUTH_SECRET="$(openssl rand -base64 32)"
export PUBLIRA_AUTH_JWT_SECRET="$(openssl rand -base64 32)"`;

export const Home = () => (
  <>
    <SiteHeader />
    <main>
      <Hero />

      <Section
        eyebrow="The repositories"
        id="projects"
        lead="Publira is the platform. Two of the pieces it needed grew into libraries of their own, and both are published for anyone to use without the rest of it."
        title="One platform, and the two libraries it grew"
        tone="surface"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {repositories.map((repository) => (
            <RepoCard
              description={repository.description}
              href={repository.href}
              install={repository.install}
              key={repository.name}
              language={repository.language}
              name={repository.name}
              role={repository.role}
            />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="The platform"
        id="platform"
        lead="A publisher gets a reader-facing site, an editorial console, and — for whoever runs the install — a console above them both."
        title="What a publisher gets on day one"
      >
        <FeatureGrid features={platformFeatures} />
      </Section>

      <Section
        eyebrow="The screens"
        id="screens"
        lead="Three Next.js apps, each with its own audience. Every screenshot below is the development seed data that ships with the repository."
        title="Three surfaces, one catalog"
        tone="surface"
      >
        <div className="space-y-20">
          <ScreenGroup
            address="publisher.example"
            app="apps/web-host"
            description="The site a reader lands on, published under the publisher's own brand. Browsing, searching, following, and the viewer that turns the pages."
            screenshots={hostScreenshots}
            title="The reader-facing site"
          />
          <ScreenGroup
            address="admin.publisher.example"
            app="apps/web-admin"
            description="Where editors work: the catalog, the publishing queue, the theme of the public site, and the record of every change made to any of it."
            screenshots={adminScreenshots}
            title="The tenant console"
          />
          <ScreenGroup
            address="platform.publira.example"
            app="apps/web-platform"
            description="One level above the tenants, for whoever operates the install: tenant status, cross-tenant events, operators, and platform-wide defaults."
            screenshots={platformScreenshots}
            title="The platform console"
          />
        </div>
      </Section>

      <Section
        eyebrow="The architecture"
        id="architecture"
        lead="Next.js at the front, Go behind Connect RPC, and nothing underneath that you cannot already run."
        title="How the pieces fit together"
      >
        <div className="space-y-8">
          <Architecture />
          <RequirementsTable />
        </div>
      </Section>

      <Section
        eyebrow="The libraries"
        id="libraries"
        lead="Both are Apache-2.0, both are used by Publira in production paths, and neither asks you to adopt the platform to use it."
        title="Two pieces you can take on their own"
        tone="surface"
      >
        <div className="space-y-8">
          <LibraryDetail
            code={comicViewerCode}
            codeLabel="app/reader.tsx"
            href="https://github.com/publira/comic-viewer"
            install="npm install @publira/comic-viewer"
            links={[
              {
                href: "https://www.npmjs.com/package/@publira/comic-viewer",
                label: "npm",
              },
              {
                href: "https://demo.comic-viewer.publira.dev/",
                label: "Demo with core.css",
              },
              {
                href: "https://demo-tw.comic-viewer.publira.dev/",
                label: "Demo with Tailwind only",
              },
            ]}
            name="@publira/comic-viewer"
            note="Pre-1.0: within a 0.x line, patch releases aim to preserve compatibility, while a minor release may change the public API. Read the changelog before upgrading."
            points={[
              "Headless UI architecture — compose independent, tree-shakeable components and style every one of them yourself.",
              "Responsive spreads that switch between single and double pages as the container width changes.",
              "Virtualization that holds large volumes of high-resolution pages without crashing a mobile browser.",
              "A pluggable data pipeline: inject fetching, decryption, or analytics through definePlugin().",
              "Right-to-left by default for manga, left-to-right for Western comics, with swipe, click, and keyboard navigation built in.",
              "Lazy page metadata through resolvePage(), for long documents and expiring signed URLs.",
            ]}
            tagline="The React comic viewer that renders the episode screen, extracted so the UI and the data pipeline stay entirely yours."
          />
          <LibraryDetail
            code={epubCode}
            codeLabel="main.go"
            href="https://github.com/publira/epub"
            install="go get github.com/publira/epub"
            links={[
              {
                href: "https://pkg.go.dev/github.com/publira/epub",
                label: "pkg.go.dev",
              },
            ]}
            name="publira/epub"
            note="Generated publications can be checked against the official W3C EPUBCheck through the script the repository ships, which caches the tool under .tools/."
            points={[
              "Filesystem-independent: Decode takes an io.ReaderAt plus the archive size, and nothing else.",
              "Fail-fast — a structural violation comes back as a DecodeError immediately.",
              "Memory efficient, with on-demand stream access through Asset.Open.",
              "Strict validation of EBPAJ and KADOKAWA-style naming and directory rules.",
              "Fixed-layout image pages wrapped in SVG, so page-fit survives the reading system.",
              "Structural semantics for cover, table of contents, bodymatter, index, and glossary landmarks.",
            ]}
            tagline="A Go library for decoding, encoding, and validating EPUB 3, built for servers that never see a file on disk."
          />
        </div>
      </Section>

      <Section
        eyebrow="Get started"
        id="start"
        lead="One command installs the toolchain and initializes the database, and a second brings up local stand-ins for everything the platform depends on."
        title="Running it locally"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="min-w-0 space-y-4">
            <CodeBlock code={setupCode} label="bash" />
            <p className="text-ink-soft text-sm leading-relaxed">
              Migrations carry the schema changes and seeds carry the initial
              data, so the local database is rebuilt the same way every time.
              Nothing here needs a cloud account: the stand-ins speak the same
              protocols the deployed services do, so the code takes one path in
              both.
            </p>
          </div>
          <div className="min-w-0 space-y-4">
            <CodeBlock
              code={secretsCode}
              label="Two keys, issued per environment"
            />
            <p className="text-ink-soft text-sm leading-relaxed">
              <code className="font-mono">PUBLIRA_AUTH_SECRET</code> is the JWE
              key that seals the login session cookie;{" "}
              <code className="font-mono">PUBLIRA_AUTH_JWT_SECRET</code> signs
              the HS256 access token the Go servers verify. Different readers,
              different purpose — and every server refuses to start when either
              is unset or shorter than 32 bytes. The values written in the
              repository are for local development only.
            </p>
          </div>
        </div>
        <p className="border-line bg-surface text-ink-soft mt-10 rounded-xl border p-5 text-sm leading-relaxed sm:p-6">
          What the repository supports today is this local setup, and it is the
          honest edge of the project: the schema, the APIs, and the surfaces
          above are still moving, and nothing here is packaged for a deployment
          you can hand to readers unchanged. Getting there means doing that work
          yourself, on a codebase that will change under you. Issues and pull
          requests are the fastest way to shape where it goes next.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            className="bg-terracotta hover:bg-ink rounded-full px-6 py-3 text-sm font-medium text-white transition-colors"
            href="https://github.com/publira/publira"
            rel="noreferrer"
            target="_blank"
          >
            Read the full setup guide
          </a>
          <a
            className="border-ink/15 bg-surface text-ink hover:border-teal hover:text-teal rounded-full border px-6 py-3 text-sm font-medium transition-colors"
            href="https://github.com/publira/publira/blob/main/CONTRIBUTING.md"
            rel="noreferrer"
            target="_blank"
          >
            Contributing
          </a>
        </div>
      </Section>
    </main>
    <SiteFooter />
  </>
);

export default Home;
