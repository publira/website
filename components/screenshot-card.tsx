import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { BrowserFrame } from "#components/browser-frame";
import { ScreenshotDialog } from "#components/screenshot-dialog";
import type { Screenshot } from "#lib/screenshots";

interface ScreenshotCardProps {
  readonly address: string;
  readonly reversed?: boolean;
  readonly screenshot: Screenshot;
  readonly sizes: string;
}

export const ScreenshotCard = async ({
  address,
  reversed = false,
  screenshot,
  sizes,
}: ScreenshotCardProps) => {
  const t = await getTranslations("screens.dialog");

  return (
    <figure className="grid gap-5 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div className={reversed ? "lg:order-2 lg:col-span-7" : "lg:col-span-7"}>
        <ScreenshotDialog
          closeLabel={t("close")}
          openLabel={t("open", { address, title: screenshot.title })}
          screenshot={screenshot}
        >
          <BrowserFrame address={address}>
            <Image
              alt={screenshot.title}
              className="w-full"
              placeholder="blur"
              sizes={sizes}
              src={screenshot.image}
            />
          </BrowserFrame>
        </ScreenshotDialog>
      </div>
      <figcaption
        className={reversed ? "lg:order-1 lg:col-span-5" : "lg:col-span-5"}
      >
        <span className="font-display text-foreground text-lg">
          {screenshot.title}
        </span>
        <span className="text-muted-foreground mt-2 block text-sm leading-relaxed">
          {screenshot.caption}
        </span>
      </figcaption>
    </figure>
  );
};
