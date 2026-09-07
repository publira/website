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

export const ScreenshotCard = ({
  address,
  reversed = false,
  screenshot,
  sizes,
}: ScreenshotCardProps) => (
  <figure className="grid gap-5 lg:grid-cols-12 lg:items-center lg:gap-12">
    <div className={reversed ? "lg:order-2 lg:col-span-7" : "lg:col-span-7"}>
      <ScreenshotDialog address={address} screenshot={screenshot}>
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
      <span className="font-display text-ink text-lg">{screenshot.title}</span>
      <span className="text-ink-soft mt-2 block text-sm leading-relaxed">
        {screenshot.caption}
      </span>
    </figcaption>
  </figure>
);
