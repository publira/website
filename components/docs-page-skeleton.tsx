import { getTranslations } from "next-intl/server";

import { SiteHeader } from "#components/site-header";

const lines = ["w-full", "w-11/12", "w-full", "w-4/5"];

/** A docs page while it loads, laid out as `DocsPage` lays out the page. */
export const DocsPageSkeleton = async () => {
  const t = await getTranslations();

  return (
    <>
      <SiteHeader section="docs" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <aside className="border-border border-b py-8 lg:border-b-0 lg:py-20">
          <div className="bg-border h-9 w-20 animate-pulse rounded-sm" />
          <div className="mt-8 hidden space-y-4 lg:block">
            {["w-32", "w-28", "w-24", "w-32", "w-24"].map((width, index) => (
              <div
                className={`bg-border h-4 animate-pulse rounded-sm ${width}`}
                // oxlint-disable-next-line no-array-index-key -- A fixed list.
                key={index}
              />
            ))}
          </div>
        </aside>
        <main aria-busy="true" className="max-w-3xl py-12 sm:py-16 lg:py-20">
          <span className="sr-only">{t("docs.loading")}</span>
          <div className="bg-border h-10 w-2/3 animate-pulse rounded-sm" />
          <div className="bg-border mt-5 h-4 w-56 animate-pulse rounded-sm" />
          {[0, 1].map((paragraph) => (
            <div className="mt-8 space-y-3" key={paragraph}>
              {lines.map((width, index) => (
                <div
                  className={`bg-border h-4 animate-pulse rounded-sm ${width}`}
                  // oxlint-disable-next-line no-array-index-key -- A fixed list.
                  key={index}
                />
              ))}
            </div>
          ))}
        </main>
      </div>
    </>
  );
};
