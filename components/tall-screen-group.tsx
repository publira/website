import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { MailFrame } from "#components/mail-frame";
import { PhoneFrame } from "#components/phone-frame";
import { ScreenshotDialog } from "#components/screenshot-dialog";
import type { Screenshot } from "#lib/screenshots";
import { getDialogViews } from "#lib/screenshots";

interface TallScreenGroupProps {
  /** Where the screens are seen, named in each dialog's accessible name. */
  readonly address: string;
  readonly app: string;
  readonly description: string;
  /** What the screens are drawn inside: a phone, or a mail client's pane. */
  readonly frame: "mail" | "phone";
  readonly screenshots: readonly Screenshot[];
  readonly title: string;
}

/** Screens that are a phone's or a message's shape rather than a page's. */
export const TallScreenGroup = async ({
  address,
  app,
  description,
  frame,
  screenshots,
  title,
}: TallScreenGroupProps) => {
  const t = await getTranslations("screens.dialog");
  const Frame = frame === "mail" ? MailFrame : PhoneFrame;
  const items = await Promise.all(
    screenshots.map(async (screenshot) => ({
      screenshot,
      views: await getDialogViews(screenshot, address),
    }))
  );

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
        {items.map(({ screenshot, views }) => {
          const [first] = screenshot.views;

          return (
            <figure key={screenshot.title}>
              <ScreenshotDialog
                caption={screenshot.caption}
                closeLabel={t("close")}
                nextLabel={t("next")}
                previousLabel={t("previous")}
                orientation={frame === "mail" ? "landscape" : "portrait"}
                thumbnailsLabel={t("thumbnails", { title: screenshot.title })}
                title={screenshot.title}
                views={views}
              >
                <Frame>
                  <Image
                    alt={first.label}
                    className="w-full"
                    placeholder="blur"
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
                    src={first.image}
                  />
                </Frame>
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
          );
        })}
      </div>
    </article>
  );
};
