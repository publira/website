import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { PhoneFrame } from "#components/phone-frame";
import { ScreenshotDialog } from "#components/screenshot-dialog";
import type { Screenshot } from "#lib/screenshots";

interface AppScreenGroupProps {
  readonly app: string;
  readonly description: string;
  readonly screenshots: readonly Screenshot[];
  readonly title: string;
}

/** The mobile client, whose screens are a phone's shape rather than a page's. */
export const AppScreenGroup = async ({
  app,
  description,
  screenshots,
  title,
}: AppScreenGroupProps) => {
  const t = await getTranslations("screens");

  return (
    <article>
      <div className="border-border flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t pt-6">
        <h3 className="font-display text-foreground break-phrase text-2xl">
          {title}
        </h3>
        <span className="text-muted-foreground text-sm tabular-nums">
          {app}
        </span>
      </div>
      <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
        {description}
      </p>
      <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {screenshots.map((screenshot) => (
          <figure key={screenshot.title}>
            <ScreenshotDialog
              closeLabel={t("dialog.close")}
              openLabel={t("dialog.open", {
                address: t("mobile.address"),
                title: screenshot.title,
              })}
              screenshot={screenshot}
            >
              <PhoneFrame>
                <Image
                  alt={screenshot.title}
                  className="w-full"
                  placeholder="blur"
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                  src={screenshot.image}
                />
              </PhoneFrame>
            </ScreenshotDialog>
            <figcaption className="mt-5">
              <span className="font-display text-foreground text-lg">
                {screenshot.title}
              </span>
              <span className="text-muted-foreground mt-2 block text-sm leading-relaxed">
                {screenshot.caption}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </article>
  );
};
