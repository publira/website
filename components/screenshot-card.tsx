import Image from "next/image";

import { BrowserFrame } from "#components/browser-frame";
import type { Screenshot } from "#lib/screenshots";

interface ScreenshotCardProps {
  readonly address: string;
  readonly priority?: boolean;
  readonly screenshot: Screenshot;
  readonly sizes: string;
}

export const ScreenshotCard = ({
  address,
  priority = false,
  screenshot,
  sizes,
}: ScreenshotCardProps) => (
  <figure>
    <BrowserFrame address={address}>
      <Image
        alt={screenshot.title}
        className="border-line w-full border-t"
        placeholder="blur"
        priority={priority}
        sizes={sizes}
        src={screenshot.image}
      />
    </BrowserFrame>
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
