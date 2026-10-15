import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ReactNode } from "react";

import { BrowserFrame } from "#components/browser-frame";
import { MailFrame } from "#components/mail-frame";
import { PhoneFrame } from "#components/phone-frame";
import { ScreenshotDialog } from "#components/screenshot-dialog";
import type { Screenshot } from "#lib/screenshots";
import { getDialogViews } from "#lib/screenshots";

interface ScreenGridProps {
  /** Where the screens are seen, named in each dialog's accessible name. */
  readonly address: string;
  readonly app: string;
  readonly description: string;
  /** The title's element, by the heading level of whatever holds the group. */
  readonly heading: "h2" | "h3";
  /** The fragment that links to it. */
  readonly id?: string;
  /** What the screens are drawn inside: a browser, a phone, or a mail pane. */
  readonly frame: "browser" | "mail" | "phone";
  /** What follows the screens, such as a link to the rest of them. */
  readonly more?: ReactNode;
  readonly screenshots: readonly Screenshot[];
  /** Whether the screens are one row, scrolled sideways below `lg`. */
  readonly strip?: boolean;
  readonly title: string;
}

// A strip shows part of the next screen, so a phone can tell that it scrolls.
const stripWidths = {
  browser: "w-4/5 sm:w-2/5",
  mail: "w-4/5 sm:w-2/5",
  phone: "w-1/2 sm:w-1/3",
};

const Frame = ({
  address,
  children,
  frame,
}: Pick<ScreenGridProps, "address" | "frame"> & { children: ReactNode }) => {
  switch (frame) {
    case "browser": {
      return <BrowserFrame address={address}>{children}</BrowserFrame>;
    }
    case "mail": {
      return <MailFrame>{children}</MailFrame>;
    }
    default: {
      return <PhoneFrame>{children}</PhoneFrame>;
    }
  }
};

/** Screens side by side, each with its caption beneath. */
export const ScreenGrid = async ({
  address,
  app,
  description,
  frame,
  heading: Heading,
  id,
  more,
  screenshots,
  strip = false,
  title,
}: ScreenGridProps) => {
  const t = await getTranslations("screens.dialog");
  const items = await Promise.all(
    screenshots.map(async (screenshot) => ({
      screenshot,
      views: await getDialogViews(screenshot, address),
    }))
  );

  return (
    <article id={id}>
      <div className="border-border flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t pt-6">
        <Heading className="font-display text-foreground break-phrase text-2xl">
          {title}
        </Heading>
        <span className="text-muted-foreground text-sm tabular-nums">
          {app}
        </span>
      </div>
      <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
        {description}
      </p>
      <div
        className={
          strip
            ? "-mx-5 mt-12 flex snap-x snap-mandatory scroll-px-5 gap-8 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-12 lg:overflow-visible lg:px-0 lg:pb-0"
            : "mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {items.map(({ screenshot, views }) => {
          const [first] = screenshot.views;

          return (
            <figure
              className={
                strip
                  ? `${stripWidths[frame]} shrink-0 snap-start lg:w-auto`
                  : undefined
              }
              key={screenshot.title}
            >
              <ScreenshotDialog
                caption={screenshot.caption}
                closeLabel={t("close")}
                orientation={frame === "phone" ? "portrait" : "landscape"}
                thumbnailsLabel={t("thumbnails", { title: screenshot.title })}
                title={screenshot.title}
                views={views}
              >
                <Frame address={address} frame={frame}>
                  <Image
                    alt={first.label}
                    className="w-full"
                    placeholder="blur"
                    sizes="(min-width: 1024px) 336px, (min-width: 640px) 45vw, 90vw"
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
      {more ? <div className="mt-16">{more}</div> : null}
    </article>
  );
};
