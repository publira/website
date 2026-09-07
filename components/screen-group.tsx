import { ScreenshotCard } from "#components/screenshot-card";
import type { Screenshot } from "#lib/screenshots";

interface ScreenGroupProps {
  readonly address: string;
  readonly app: string;
  readonly description: string;
  readonly screenshots: readonly Screenshot[];
  readonly title: string;
}

export const ScreenGroup = ({
  address,
  app,
  description,
  screenshots,
  title,
}: ScreenGroupProps) => (
  <article>
    <div className="border-line flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t pt-6">
      <h3 className="font-display text-ink text-2xl">{title}</h3>
      <span className="text-ink-soft text-sm tabular-nums">{app}</span>
    </div>
    <p className="text-ink-soft mt-3 max-w-2xl leading-relaxed">
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
  </article>
);
