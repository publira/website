import type { ReactNode } from "react";

import { ScreenshotCard } from "#components/screenshot-card";
import type { Screenshot } from "#lib/screenshots";

interface ScreenGroupProps {
  readonly address: string;
  readonly app: string;
  readonly description: string;
  /** The title's element, by the heading level of whatever holds the group. */
  readonly heading: "h2" | "h3";
  /** The fragment that links to it. */
  readonly id?: string;
  /** What follows the screens, such as a link to the rest of them. */
  readonly more?: ReactNode;
  readonly screenshots: readonly Screenshot[];
  readonly title: string;
}

export const ScreenGroup = ({
  address,
  app,
  description,
  heading: Heading,
  id,
  more,
  screenshots,
  title,
}: ScreenGroupProps) => (
  <article id={id}>
    <div className="border-border flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t pt-6">
      <Heading className="font-display text-foreground break-phrase text-2xl">
        {title}
      </Heading>
      <span className="text-muted-foreground text-sm tabular-nums">{app}</span>
    </div>
    <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
      {description}
    </p>
    <div className="mt-12 space-y-24">
      {screenshots.map((screenshot, index) => (
        <ScreenshotCard
          address={address}
          key={screenshot.title}
          reversed={index % 2 === 1}
          screenshot={screenshot}
          sizes="(min-width: 1024px) 672px, 100vw"
        />
      ))}
    </div>
    {more ? <div className="mt-16">{more}</div> : null}
  </article>
);
