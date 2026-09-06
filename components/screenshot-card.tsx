import Image from "next/image";

import { BrowserFrame } from "#components/browser-frame";
import { ScreenshotDialog } from "#components/screenshot-dialog";
import type { Screenshot } from "#lib/screenshots";

interface ScreenshotCardProps {
  readonly address: string;
  readonly screenshot: Screenshot;
  readonly sizes: string;
}

export const ScreenshotCard = ({
  address,
  screenshot,
  sizes,
}: ScreenshotCardProps) => (
  <figure>
    <ScreenshotDialog address={address} screenshot={screenshot}>
      <BrowserFrame address={address}>
        <Image
          alt={screenshot.title}
          className="border-line w-full border-t"
          placeholder="blur"
          sizes={sizes}
          src={screenshot.image}
        />
      </BrowserFrame>
    </ScreenshotDialog>
    <figcaption className="mt-4">
      <span className="font-display text-ink text-lg font-medium">
        {screenshot.title}
      </span>
      <span className="text-ink-soft mt-1 block text-sm leading-relaxed">
        {screenshot.caption}
      </span>
    </figcaption>
  </figure>
);
