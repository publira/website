const repositories = [
  { href: "https://github.com/publira/publira", name: "publira/publira" },
  {
    href: "https://github.com/publira/comic-viewer",
    name: "publira/comic-viewer",
  },
  { href: "https://github.com/publira/epub", name: "publira/epub" },
];

export const SiteFooter = () => (
  <footer className="border-line bg-canvas-deep/50 border-t">
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8">
      <div>
        <p className="font-display text-ink text-xl font-bold">Publira</p>
        <p className="text-ink-soft mt-3 max-w-sm text-sm leading-relaxed">
          An open-source project that values portability, ease of operation, and
          freedom from vendor lock-in. Every repository is licensed under
          Apache-2.0.
        </p>
      </div>
      <nav aria-label="Repositories" className="sm:justify-self-end">
        <p className="text-ink-soft text-xs tracking-[0.18em] uppercase">
          Repositories
        </p>
        <ul className="mt-4 space-y-2">
          {repositories.map((repository) => (
            <li key={repository.href}>
              <a
                className="text-ink hover:text-terracotta font-mono text-sm transition-colors"
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
    <div className="border-line border-t">
      <p className="text-ink-soft mx-auto max-w-6xl px-5 py-6 text-xs sm:px-8">
        Every screenshot on this page is the development seed data that ships
        with the repository.
      </p>
    </div>
  </footer>
);
