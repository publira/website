import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "#components/json-ld";
import { LibraryDetail } from "#components/library-detail";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";
import { getRootLocale } from "#i18n/locale";
import { getAlternates, getOpenGraph } from "#i18n/metadata";
import type { Page } from "#lib/site";
import { getPageUrl } from "#lib/structured-data";

const page: Page = "/libraries";

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

export const generateMetadata = async (): Promise<Metadata> => {
  const [locale, t] = await Promise.all([getRootLocale(), getTranslations()]);
  const title = t("libraries.metadata.title");

  return {
    alternates: getAlternates(page, locale),
    description: t("libraries.metadata.description"),
    openGraph: getOpenGraph(page, locale, {
      siteName: t("site.name"),
      title,
    }),
    title,
  };
};

const Libraries = async () => {
  const [locale, t] = await Promise.all([getRootLocale(), getTranslations()]);

  return (
    <>
      <JsonLd
        graph={[
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { item: getPageUrl("/", locale), name: t("site.name") },
              {
                item: getPageUrl(page, locale),
                name: t("libraries.metadata.title"),
              },
            ].map((crumb, index) => ({
              ...crumb,
              "@type": "ListItem",
              position: index + 1,
            })),
          },
        ]}
      />
      <SiteHeader section="libraries" />
      <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <h1 className="font-display text-foreground break-phrase max-w-3xl text-4xl text-balance sm:text-5xl">
          {t("libraries.title")}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          {t("libraries.lead")}
        </p>
        <div className="mt-12 space-y-16">
          <LibraryDetail
            code={comicViewerCode}
            codeLabel="app/reader.tsx"
            codeLang="typescript"
            href="https://github.com/publira/comic-viewer"
            id="comic-viewer"
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
            id="epub"
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
      </main>
      <SiteFooter />
    </>
  );
};

export default Libraries;
