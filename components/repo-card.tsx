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
    className="group border-border flex flex-col border-l pl-5"
    href={href}
    rel="noreferrer"
    target="_blank"
  >
    <span className="text-muted-foreground text-sm">{role}</span>
    <span className="font-display text-foreground group-hover:text-primary mt-2 text-xl">
      {name}
    </span>
    <span className="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed">
      {description}
    </span>
    <span className="text-muted-foreground mt-5 flex flex-wrap items-center text-xs tabular-nums">
      <span>{language}</span>
      {install ? (
        <span className="border-border ml-3 border-l pl-3">{install}</span>
      ) : null}
    </span>
  </a>
);
