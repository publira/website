"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { Screenshot } from "#lib/screenshots";

interface ScreenshotDialogProps {
  readonly children: ReactNode;
  readonly closeLabel: string;
  readonly openLabel: string;
  readonly screenshot: Screenshot;
}

export const ScreenshotDialog = ({
  children,
  closeLabel,
  openLabel,
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
        aria-label={openLabel}
        className="block w-full cursor-zoom-in rounded-lg"
        onClick={() => setIsEnlarged(true)}
        type="button"
      >
        {children}
      </button>
      <dialog
        aria-describedby={captionId}
        aria-labelledby={titleId}
        className="border-border bg-popover backdrop:bg-foreground/70 open:shadow-dialog m-auto max-h-[92dvh] w-[min(90rem,92vw)] max-w-none overflow-y-auto rounded-lg border p-0"
        onClose={() => setIsEnlarged(false)}
        ref={dialogRef}
      >
        {isEnlarged ? (
          <div className="relative flex flex-col">
            <Image
              alt={screenshot.title}
              className="bg-muted max-h-[70dvh] w-full object-contain"
              placeholder="blur"
              sizes="(min-width: 1536px) 1440px, 92vw"
              src={screenshot.image}
            />
            <button
              aria-label={closeLabel}
              className="border-border bg-card text-muted-foreground hover:text-primary absolute top-3 right-3 flex size-9 items-center justify-center rounded-sm border text-xl leading-none"
              onClick={close}
              type="button"
            >
              ×
            </button>
            <div className="border-border flex items-start justify-between gap-6 border-t p-5">
              <div className="min-w-0">
                <span
                  className="font-display text-foreground block text-lg"
                  id={titleId}
                >
                  {screenshot.title}
                </span>
                <span
                  className="text-muted-foreground mt-1 block text-sm leading-relaxed"
                  id={captionId}
                >
                  {screenshot.caption}
                </span>
              </div>
              <button
                className="border-primary text-primary hover:bg-accent shrink-0 rounded-sm border px-4 py-2 text-sm font-medium"
                onClick={close}
                type="button"
              >
                {closeLabel}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
};
