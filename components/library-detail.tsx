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
  <article className="border-line grid gap-8 border-l pl-5 lg:grid-cols-2 lg:gap-12">
    <div className="min-w-0">
      <h3 className="font-display text-ink text-2xl">{name}</h3>
      <p className="text-ink-soft mt-3 leading-relaxed">{tagline}</p>
      <ul className="text-ink-soft marker:text-line mt-6 list-disc space-y-3 pl-5 text-sm leading-relaxed">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p className="text-ink-soft mt-6 text-xs leading-relaxed">{note}</p>
      <a
        className="border-ai text-ai hover:bg-ai-soft mt-6 inline-block rounded-sm border px-5 py-2.5 text-sm font-medium"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        Read the documentation
      </a>
    </div>
    <div className="min-w-0 space-y-4">
      <CodeBlock code={install} label="Install" />
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <a
              className="text-ai text-sm hover:underline"
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
