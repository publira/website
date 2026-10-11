import type { ComponentProps } from "react";

import { Link } from "#i18n/navigation";

interface RepoCardProps {
  readonly description: string;
  /** The repository, which opens in a new tab. */
  readonly href: string;
  readonly install?: string;
  readonly language: string;
  readonly name: string;
  /** A page of the site that describes it, which the card leads to instead. */
  readonly page?: ComponentProps<typeof Link>["href"];
  readonly role: string;
}

const className = "group border-border flex flex-col border-l pl-5";

export const RepoCard = ({
  description,
  href,
  install,
  language,
  name,
  page,
  role,
}: RepoCardProps) => {
  const content = (
    <>
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
    </>
  );

  if (page) {
    return (
      <Link className={className} href={page}>
        {content}
      </Link>
    );
  }

  return (
    <a className={className} href={href} rel="noreferrer" target="_blank">
      {content}
    </a>
  );
};
