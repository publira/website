import { CodeBlock } from "#components/code-block";

interface LibraryLink {
  readonly href: string;
  readonly label: string;
}

interface LibraryDetailProps {
  readonly code: string;
  readonly codeLabel: string;
  readonly href: string;
  readonly install: string;
  readonly links: readonly LibraryLink[];
  readonly name: string;
  readonly note: string;
  readonly points: readonly string[];
  readonly tagline: string;
}

export const LibraryDetail = ({
  code,
  codeLabel,
  href,
  install,
  links,
  name,
  note,
  points,
  tagline,
}: LibraryDetailProps) => (
  <article className="border-line bg-surface grid gap-8 rounded-xl border p-6 sm:p-8 lg:grid-cols-2 lg:gap-12">
    <div className="min-w-0">
      <h3 className="font-display text-ink text-2xl">{name}</h3>
      <p className="text-ink-soft mt-3 leading-relaxed">{tagline}</p>
      <ul className="mt-6 space-y-3">
        {points.map((point) => (
          <li
            className="text-ink-soft flex gap-3 text-sm leading-relaxed"
            key={point}
          >
            <span
              aria-hidden="true"
              className="bg-terracotta mt-2 size-1.5 shrink-0 rounded-full"
            />
            {point}
          </li>
        ))}
      </ul>
      <p className="text-ink-soft mt-6 text-xs leading-relaxed">{note}</p>
      <a
        className="border-ink/15 text-ink hover:border-teal hover:text-teal mt-6 inline-block rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        Read the documentation
      </a>
    </div>
    <div className="min-w-0 space-y-4">
      <CodeBlock code={install} label="Install" />
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              className="border-ink/15 text-ink-soft hover:border-teal hover:text-teal inline-block rounded-full border px-4 py-1.5 text-xs font-medium transition-colors"
              href={link.href}
              rel="noreferrer"
              target="_blank"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <CodeBlock code={code} label={codeLabel} />
    </div>
  </article>
);
