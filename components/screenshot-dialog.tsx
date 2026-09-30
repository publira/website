"use client";

import Image from "next/image";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { DialogView } from "#lib/screenshots";

interface ScreenshotDialogProps {
  readonly caption: string;
  /** The framed first view, which opens the dialog on that view. */
  readonly children: ReactNode;
  readonly closeLabel: string;
  readonly nextLabel: string;
  readonly previousLabel: string;
  /** Whether the screens are landscape or portrait, which their thumbnails follow. */
  readonly orientation: "landscape" | "portrait";
  readonly thumbnailsLabel: string;
  readonly title: string;
  readonly views: readonly DialogView[];
}

const stepButton =
  "border-border text-foreground hover:border-primary hover:text-primary flex size-9 items-center justify-center rounded-sm border text-lg leading-none aria-disabled:pointer-events-none aria-disabled:opacity-40";

export const ScreenshotDialog = ({
  caption,
  children,
  closeLabel,
  nextLabel,
  previousLabel,
  orientation,
  thumbnailsLabel,
  title,
  views,
}: ScreenshotDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const captionId = useId();
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const hasSeveral = views.length > 1;
  const [first] = views;
  const view = views[current] ?? first;

  const open = (index: number) => {
    setCurrent(index);
    setOpenedAt(index);
  };

  const close = () => dialogRef.current?.close();

  // The track snaps one view per width, so showing a view is scrolling to its
  // offset, and `onScroll` reports the view a swipe or a scroll came to rest on.
  const show = (index: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const clamped = Math.min(Math.max(index, 0), views.length - 1);
    track.scrollTo({ left: clamped * track.clientWidth });
  };

  const showOnArrowKey = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(current - 1);
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    const track = trackRef.current;
    if (!(dialog && track) || openedAt === null) {
      return;
    }

    dialog.showModal();
    track.scrollTo({ behavior: "instant", left: openedAt * track.clientWidth });

    const closeOnBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) {
        dialog.close();
      }
    };

    dialog.addEventListener("click", closeOnBackdrop);

    return () => dialog.removeEventListener("click", closeOnBackdrop);
  }, [openedAt]);

  if (!(first && view)) {
    return null;
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={first.openLabel}
        className="block w-full cursor-zoom-in rounded-lg"
        onClick={() => open(0)}
        type="button"
      >
        {children}
      </button>
      {hasSeveral ? (
        <ul
          aria-label={thumbnailsLabel}
          className="mt-3 flex flex-wrap justify-center gap-2"
        >
          {views.map((thumbnail, index) => (
            <li key={thumbnail.label}>
              <button
                aria-haspopup="dialog"
                aria-label={thumbnail.openLabel}
                className="border-border hover:border-primary block cursor-zoom-in overflow-hidden rounded-sm border"
                onClick={() => open(index)}
                type="button"
              >
                <Image
                  alt=""
                  className={
                    orientation === "landscape"
                      ? "bg-muted h-14 w-24 object-cover object-top"
                      : "bg-muted h-20 w-10 object-cover object-top"
                  }
                  sizes="96px"
                  src={thumbnail.image}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <dialog
        aria-describedby={captionId}
        aria-labelledby={titleId}
        className="border-border bg-popover backdrop:bg-foreground/70 open:shadow-dialog m-auto max-h-[92dvh] w-[min(90rem,92vw)] max-w-none overflow-y-auto rounded-lg border p-0"
        onClose={() => setOpenedAt(null)}
        onKeyDown={hasSeveral ? showOnArrowKey : undefined}
        ref={dialogRef}
      >
        {openedAt === null ? null : (
          <div className="relative flex flex-col">
            <div
              className="bg-muted flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth motion-reduce:scroll-auto"
              onScroll={(event) => {
                const track = event.currentTarget;
                setCurrent(Math.round(track.scrollLeft / track.clientWidth));
              }}
              ref={trackRef}
            >
              {views.map((slide) => (
                <div
                  className="flex w-full shrink-0 snap-center justify-center"
                  key={slide.label}
                >
                  <Image
                    alt={slide.label}
                    className="max-h-[70dvh] w-auto object-contain"
                    placeholder="blur"
                    sizes="(min-width: 1536px) 1440px, 92vw"
                    src={slide.image}
                  />
                </div>
              ))}
            </div>
            <button
              aria-label={closeLabel}
              className="border-border bg-card text-muted-foreground hover:text-primary absolute top-3 right-3 flex size-9 items-center justify-center rounded-sm border text-xl leading-none"
              onClick={close}
              type="button"
            >
              ×
            </button>
            <div className="border-border flex flex-wrap items-start justify-between gap-x-6 gap-y-4 border-t p-5">
              <div className="min-w-0 flex-1 basis-80">
                <span
                  className="font-display text-foreground block text-lg"
                  id={titleId}
                >
                  {title}
                </span>
                <span
                  className="text-muted-foreground mt-1 block text-sm leading-relaxed"
                  id={captionId}
                >
                  {caption}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {hasSeveral ? (
                  <>
                    <p
                      aria-live="polite"
                      className="text-muted-foreground mr-1 text-right text-sm"
                    >
                      <span className="text-foreground block">
                        {view.label}
                      </span>
                      <span className="tabular-nums">{view.position}</span>
                    </p>
                    <button
                      aria-label={previousLabel}
                      className={stepButton}
                      aria-disabled={current === 0}
                      onClick={() => show(current - 1)}
                      type="button"
                    >
                      ‹
                    </button>
                    <button
                      aria-label={nextLabel}
                      className={stepButton}
                      aria-disabled={current === views.length - 1}
                      onClick={() => show(current + 1)}
                      type="button"
                    >
                      ›
                    </button>
                  </>
                ) : null}
                <button
                  className="border-primary text-primary hover:bg-accent shrink-0 rounded-sm border px-4 py-2 text-sm font-medium"
                  onClick={close}
                  type="button"
                >
                  {closeLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
};
