import { getTranslations } from "next-intl/server";

const repositories = [
  { href: "https://github.com/publira/publira", name: "publira/publira" },
  {
    href: "https://github.com/publira/comic-viewer",
    name: "publira/comic-viewer",
  },
  { href: "https://github.com/publira/epub", name: "publira/epub" },
];

export const SiteFooter = async () => {
  const t = await getTranslations();

  return (
    <footer className="border-border bg-surface border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8">
        <div>
          <p className="font-display text-foreground text-xl">
            {t("site.name")}
          </p>
          <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
            {t("footer.about")}
          </p>
        </div>
        <nav
          aria-label={t("footer.repositories")}
          className="sm:justify-self-end"
        >
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
      </div>
      <div className="border-border border-t">
        <p className="text-muted-foreground mx-auto max-w-6xl px-5 py-6 text-xs sm:px-8">
          {t("footer.seedData")}
        </p>
      </div>
    </footer>
  );
};
