"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { Screenshot } from "#lib/screenshots";

interface ScreenshotDialogProps {
  readonly address: string;
  readonly children: ReactNode;
  readonly screenshot: Screenshot;
}

export const ScreenshotDialog = ({
  address,
  children,
  screenshot,
}: ScreenshotDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const captionId = useId();
  const [isEnlarged, setIsEnlarged] = useState(false);

  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!(dialog && isEnlarged)) {
      return;
    }

    dialog.showModal();

    const closeOnBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) {
        dialog.close();
      }
    };

    dialog.addEventListener("click", closeOnBackdrop);

    return () => dialog.removeEventListener("click", closeOnBackdrop);
  }, [isEnlarged]);

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={`Open the ${screenshot.title} screenshot of ${address} at full size`}
        className="focus-visible:outline-teal block w-full cursor-zoom-in rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
        onClick={() => setIsEnlarged(true)}
        type="button"
      >
        {children}
      </button>
      <dialog
        aria-describedby={captionId}
        aria-labelledby={titleId}
        className="border-line bg-surface backdrop:bg-ink/70 m-auto max-h-[92dvh] w-[min(90rem,92vw)] max-w-none overflow-y-auto rounded-xl border p-0"
        onClose={() => setIsEnlarged(false)}
        ref={dialogRef}
      >
        {isEnlarged ? (
          <div className="relative flex flex-col">
            <Image
              alt={screenshot.title}
              className="bg-canvas-deep max-h-[70dvh] w-full object-contain"
              placeholder="blur"
              sizes="(min-width: 1536px) 1440px, 92vw"
              src={screenshot.image}
            />
            <button
              aria-label="Close"
              className="border-line bg-surface/90 text-ink-soft hover:border-teal hover:text-teal absolute top-3 right-3 flex size-9 items-center justify-center rounded-full border text-xl leading-none shadow-[0_6px_20px_-12px_rgba(27,40,54,0.6)] transition-colors"
              onClick={close}
              type="button"
            >
              ×
            </button>
            <div className="border-line flex items-start justify-between gap-6 border-t p-5">
              <div className="min-w-0">
                <span
                  className="font-display text-ink block text-lg font-medium"
                  id={titleId}
                >
                  {screenshot.title}
                </span>
                <span
                  className="text-ink-soft mt-1 block text-sm leading-relaxed"
                  id={captionId}
                >
                  {screenshot.caption}
                </span>
              </div>
              <button
                className="border-ink/15 text-ink hover:border-teal hover:text-teal shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                onClick={close}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
};
