import Link from "next/link";

const navigation = [
  { href: "#platform", label: "Platform" },
  { href: "#screens", label: "Screens" },
  { href: "#architecture", label: "Architecture" },
  { href: "#libraries", label: "Libraries" },
  { href: "#start", label: "Get started" },
];

export const SiteHeader = () => (
  <header className="border-line/80 bg-canvas/85 sticky top-0 z-50 border-b backdrop-blur-md">
    <div className="bg-terracotta h-1" />
    <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
      <Link className="flex items-baseline gap-2" href="/">
        <span className="font-display text-ink text-xl font-bold tracking-tight">
          Publira
        </span>
        <span className="text-ink-soft hidden text-xs tracking-[0.18em] uppercase sm:inline">
          Open source · In development
        </span>
      </Link>

      <nav
        aria-label="Sections"
        className="ml-auto hidden items-center gap-6 lg:flex"
      >
        {navigation.map((item) => (
          <a
            className="text-ink-soft hover:text-terracotta text-sm transition-colors"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a
        className="bg-teal hover:bg-ink ml-auto rounded-full px-4 py-2 text-sm font-medium text-white transition-colors lg:ml-0"
        href="https://github.com/publira/publira"
        rel="noreferrer"
        target="_blank"
      >
        GitHub
      </a>
    </div>
  </header>
);
