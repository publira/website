import Link from "next/link";

const navigation = [
  { href: "#platform", label: "Platform" },
  { href: "#screens", label: "Screens" },
  { href: "#architecture", label: "Architecture" },
  { href: "#libraries", label: "Libraries" },
  { href: "#start", label: "Get started" },
];

export const SiteHeader = () => (
  <header className="border-line bg-surface sticky top-0 z-50 border-b">
    <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
      <Link className="flex items-baseline gap-3" href="/">
        <span className="font-display text-ink text-xl">Publira</span>
        <span className="text-ink-soft hidden text-sm sm:inline">
          Open source, still in development
        </span>
      </Link>

      <nav
        aria-label="Sections"
        className="ml-auto hidden items-center gap-6 lg:flex"
      >
        {navigation.map((item) => (
          <a
            className="text-ink-soft hover:text-ink text-sm"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a
        className="border-ai text-ai hover:bg-ai-soft ml-auto rounded-sm border px-4 py-2 text-sm font-medium lg:ml-0"
        href="https://github.com/publira/publira"
        rel="noreferrer"
        target="_blank"
      >
        GitHub
      </a>
    </div>
  </header>
);
