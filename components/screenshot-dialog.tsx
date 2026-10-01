"use client";

import Image from "next/image";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

import type { DialogView } from "#lib/screenshots";

interface ScreenshotDialogProps {
  readonly caption: string;
  /** The framed first view, which opens the dialog on that view. */
  readonly children: ReactNode;
  readonly closeLabel: string;
  /**
   * Whether the screens are landscape or portrait. The thumbnails follow it,
   * and the dialog puts a portrait screen's title and caption beside it.
   */
  readonly orientation: "landscape" | "portrait";
  readonly thumbnailsLabel: string;
  readonly title: string;
  readonly views: readonly DialogView[];
}

// The picture sets the dialog's width: as wide as the screen was taken, short
// enough to leave room for the text, and never wider than the viewport. Its
// height follows from the width, so the picture fills the dialog with no bars
// at its sides and holds its place while it loads.
const layouts = {
  landscape: {
    body: "flex flex-col",
    picture: "w-[min(var(--natural),92vw,70dvh*var(--ratio))]",
    sizes: "(min-width: 1536px) 1440px, 92vw",
    text: "border-t min-w-full w-0",
  },
  portrait: {
    body: "flex flex-col sm:flex-row",
    picture:
      "w-[min(var(--natural),92vw,70dvh*var(--ratio))] sm:w-[min(var(--natural),88dvh*var(--ratio),92vw_-_20rem)]",
    sizes: "(min-width: 640px) 480px, 70vw",
    text: "border-t min-w-full w-0 sm:w-80 sm:min-w-0 sm:border-t-0 sm:border-l",
  },
} as const;

interface ViewDotsProps {
  readonly current: number;
  readonly label: string;
  readonly onShow: (index: number) => void;
  readonly views: readonly DialogView[];
}

/** One dot per view, marking the current one; pressing a dot shows its view. */
const ViewDots = ({ current, label, onShow, views }: ViewDotsProps) => (
  <ul
    aria-label={label}
    className="border-border bg-card/90 pointer-events-auto flex rounded-full border px-1"
  >
    {views.map((dot, index) => (
      <li key={dot.label}>
        <button
          aria-current={index === current}
          aria-label={dot.label}
          className="group flex size-6 items-center justify-center"
          onClick={() => onShow(index)}
          type="button"
        >
          <span className="bg-muted-foreground/50 group-hover:bg-primary group-aria-[current=true]:bg-primary block h-2 w-2 rounded-full transition-[width] group-aria-[current=true]:w-4 motion-reduce:transition-none" />
        </button>
      </li>
    ))}
  </ul>
);

export const ScreenshotDialog = ({
  caption,
  children,
  closeLabel,
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
  const layout = layouts[orientation];

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
        className="border-border bg-popover backdrop:bg-foreground/70 open:shadow-dialog m-auto max-h-[92dvh] w-fit max-w-none overflow-y-auto rounded-lg border p-0"
        onClose={() => setOpenedAt(null)}
        onKeyDown={hasSeveral ? showOnArrowKey : undefined}
        ref={dialogRef}
        style={
          // SAFETY: both keys are custom properties, which React sets as they
          // are and `CSSProperties` has no type for.
          {
            "--natural": `${first.image.width}px`,
            "--ratio": `${first.image.width} / ${first.image.height}`,
          } as CSSProperties
        }
      >
        {openedAt === null ? null : (
          <div className={layout.body}>
            <div className={`relative shrink-0 ${layout.picture}`}>
              {/*
                The overlays let a swipe through to the track around them. The
                close button comes before the track, which can take focus as a
                scroller, so that opening the dialog focuses the button.
              */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start gap-3 p-3">
                {hasSeveral ? (
                  <p
                    aria-live="polite"
                    className="border-border bg-card/90 text-foreground pointer-events-auto min-w-0 rounded-sm border px-2.5 py-1.5 text-sm leading-snug"
                  >
                    {view.label}
                    <span className="sr-only"> {view.position}</span>
                  </p>
                ) : null}
                <button
                  aria-label={closeLabel}
                  className="border-border bg-card text-muted-foreground hover:text-primary pointer-events-auto ml-auto flex size-9 shrink-0 items-center justify-center rounded-sm border text-xl leading-none"
                  onClick={close}
                  type="button"
                >
                  ×
                </button>
              </div>
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
                    className="w-full shrink-0 snap-center"
                    key={slide.label}
                  >
                    <Image
                      alt={slide.label}
                      className="w-full"
                      placeholder="blur"
                      sizes={layout.sizes}
                      src={slide.image}
                    />
                  </div>
                ))}
              </div>
              {hasSeveral ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                  <ViewDots
                    current={current}
                    label={thumbnailsLabel}
                    onShow={show}
                    views={views}
                  />
                </div>
              ) : null}
            </div>
            <div className={`border-border p-5 ${layout.text}`}>
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
          </div>
        )}
      </dialog>
    </>
  );
};
