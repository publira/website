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
    <div className="flex flex-wrap items-baseline gap-3">
      <h3 className="font-display text-ink text-2xl">{title}</h3>
      <span className="bg-canvas-deep text-ink-soft rounded-full px-3 py-1 font-mono text-xs">
        {app}
      </span>
    </div>
    <p className="text-ink-soft mt-3 max-w-2xl leading-relaxed">
      {description}
    </p>
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      {screenshots.map((screenshot) => (
        <ScreenshotCard
          address={address}
          key={screenshot.title}
          screenshot={screenshot}
          sizes="(min-width: 1024px) 560px, 100vw"
        />
      ))}
    </div>
  </article>
);
