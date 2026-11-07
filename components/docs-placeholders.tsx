import { getTranslations } from "next-intl/server";

// What the docs frame shows where its sidebar and its article stream in.

/** The width of each placeholder line, the last of a paragraph shorter. */
const lines = ["w-full", "w-11/12", "w-10/12", "w-4/5"];

const Placeholder = ({ className }: { readonly className: string }) => (
  <div className={`bg-border animate-pulse rounded-sm ${className}`} />
);

export const DocsSidebarPlaceholder = () => (
  <div aria-hidden="true">
    <Placeholder className="h-9 w-20" />
    <Placeholder className="mt-4 h-9 w-full lg:hidden" />
    <div className="mt-6 hidden space-y-4 lg:block">
      {["w-32", "w-28", "w-24", "w-36"].map((width) => (
        <Placeholder className={`h-4 ${width}`} key={width} />
      ))}
    </div>
  </div>
);

export const DocsHeadingPlaceholder = () => (
  <div aria-hidden="true">
    <Placeholder className="h-10 w-2/3" />
    <Placeholder className="mt-5 h-4 w-56" />
  </div>
);

/** The article body's lines, and that it is loading for a screen reader. */
export const DocsBodyPlaceholder = async () => {
  const t = await getTranslations();

  return (
    <div aria-busy="true">
      <span className="sr-only">{t("docs.loading")}</span>
      {[0, 1].map((paragraph) => (
        <div className="mt-8 space-y-3" key={paragraph}>
          {lines.map((width) => (
            <Placeholder className={`h-4 ${width}`} key={width} />
          ))}
        </div>
      ))}
    </div>
  );
};
