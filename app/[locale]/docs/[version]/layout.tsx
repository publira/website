import { Suspense } from "react";

import { DocsSidebarPlaceholder } from "#components/docs-placeholders";
import { DocsSidebar } from "#components/docs-sidebar";
import { SiteFooter } from "#components/site-footer";
import { SiteHeader } from "#components/site-header";

// The frame and the sidebar of a version's pages, which stay as the reader
// moves between them, while the article streams in below.
const DocsLayout = ({
  children,
  params,
}: LayoutProps<"/[locale]/docs/[version]">) => (
  <>
    <SiteHeader section="docs" />
    <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
      <aside className="border-border border-b py-8 lg:border-b-0 lg:py-20">
        <Suspense fallback={<DocsSidebarPlaceholder />}>
          {params.then(({ version }) => (
            <DocsSidebar version={version} />
          ))}
        </Suspense>
      </aside>
      <main className="max-w-3xl py-12 sm:py-16 lg:py-20">{children}</main>
    </div>
    <SiteFooter />
  </>
);

export default DocsLayout;
