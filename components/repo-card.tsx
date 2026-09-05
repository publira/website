interface RepoCardProps {
  readonly description: string;
  readonly href: string;
  readonly install?: string;
  readonly language: string;
  readonly name: string;
  readonly role: string;
}

export const RepoCard = ({
  description,
  href,
  install,
  language,
  name,
  role,
}: RepoCardProps) => (
  <a
    className="group border-line bg-surface hover:border-terracotta flex flex-col rounded-xl border p-6 transition-colors"
    href={href}
    rel="noreferrer"
    target="_blank"
  >
    <span className="text-terracotta text-xs tracking-[0.18em] uppercase">
      {role}
    </span>
    <span className="font-display text-ink group-hover:text-terracotta mt-3 text-xl">
      {name}
    </span>
    <span className="text-ink-soft mt-3 flex-1 text-sm leading-relaxed">
      {description}
    </span>
    <span className="mt-5 flex flex-wrap items-center gap-2">
      <span className="bg-teal-soft text-teal rounded-full px-3 py-1 text-xs font-medium">
        {language}
      </span>
      {install ? (
        <span className="bg-canvas-deep text-ink-soft rounded-full px-3 py-1 font-mono text-xs">
          {install}
        </span>
      ) : null}
    </span>
  </a>
);
