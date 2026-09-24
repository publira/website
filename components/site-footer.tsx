import { getTranslations } from "next-intl/server";

import { Link } from "#i18n/navigation";

const repositories = [
  { href: "https://github.com/publira/publira", name: "publira/publira" },
  {
    href: "https://github.com/publira/comic-viewer",
    name: "publira/comic-viewer",
  },
  { href: "https://github.com/publira/epub", name: "publira/epub" },
];

const policies = ["privacy", "terms"] as const;

interface SiteFooterProps {
  /** A remark about the page above, set apart under the footer. */
  readonly note?: string;
}

export const SiteFooter = async ({ note }: SiteFooterProps) => {
  const t = await getTranslations();

  return (
    <footer className="border-border bg-surface border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1fr_auto_auto] lg:gap-x-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-display text-foreground text-xl">
            {t("site.name")}
          </p>
          <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
            {t("footer.about")}
          </p>
        </div>
        <nav aria-label={t("footer.repositories")}>
          <p className="text-muted-foreground text-sm">
            {t("footer.repositories")}
          </p>
          <ul className="mt-4 space-y-2">
            {repositories.map((repository) => (
              <li key={repository.href}>
                <a
                  className="text-primary text-sm hover:underline"
                  href={repository.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {repository.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t("footer.policies")}>
          <p className="text-muted-foreground text-sm">
            {t("footer.policies")}
          </p>
          <ul className="mt-4 space-y-2">
            {policies.map((policy) => (
              <li key={policy}>
                <Link
                  className="text-primary text-sm hover:underline"
                  href={`/${policy}`}
                >
                  {t(`footer.${policy}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {note ? (
        <div className="border-border border-t">
          <p className="text-muted-foreground mx-auto max-w-6xl px-5 py-6 text-xs sm:px-8">
            {note}
          </p>
        </div>
      ) : null}
    </footer>
  );
};
