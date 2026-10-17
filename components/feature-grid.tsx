"use client";

import type { TransitionEvent } from "react";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

export interface Feature {
  readonly body: string;
  readonly title: string;
}

interface FeatureGridProps {
  readonly features: readonly Feature[];
  readonly showAllLabel: string;
}

// Collapsed, the list shows whole rows of one, two, or three features by the
// width, cuts the next row short under the fade, and hides the rest. Rows
// rather than a fixed height, since a feature's length differs by locale.
const collapsedClassName = (index: number) => {
  if (index < 3) {
    return "";
  }

  if (index === 3) {
    return "overflow-hidden max-sm:max-h-32";
  }

  if (index < 6) {
    return "overflow-hidden max-sm:hidden sm:max-lg:max-h-32";
  }

  if (index < 9) {
    return "overflow-hidden max-lg:hidden lg:max-h-32";
  }

  return "hidden";
};

// Without JavaScript the button cannot open the list, so it shows in full.
const noscriptStyle = `[data-feature-grid] li { display: block; max-height: none; }
[data-feature-grid-fade] { display: none; }`;

export const FeatureGrid = ({ features, showAllLabel }: FeatureGridProps) => {
  const listId = useId();
  const clipRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [state, setState] = useState<"collapsed" | "opening" | "open">(
    "collapsed"
  );

  const open = () => {
    const clip = clipRef.current;

    // Without a transition `transitionend` never fires to clear the height.
    if (clip && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Hold the collapsed height while the rest renders, then grow to it.
      clip.style.maxHeight = `${clip.offsetHeight}px`;
      flushSync(() => setState("opening"));
      clip.style.maxHeight = `${clip.scrollHeight}px`;
    } else {
      setState("open");
    }

    // The button goes once the list is open, so focus moves to the list.
    listRef.current?.focus({ preventScroll: true });
  };

  // Left at the measured height, the list would clip after a resize.
  const finish = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === "max-height"
    ) {
      event.currentTarget.style.maxHeight = "";
      setState("open");
    }
  };

  return (
    <div
      className={`relative transition-[max-height] duration-700 ease-out motion-reduce:transition-none ${state === "opening" ? "overflow-hidden" : ""}`}
      data-feature-grid=""
      onTransitionCancel={finish}
      onTransitionEnd={finish}
      ref={clipRef}
    >
      <ul
        className="border-border bg-border grid gap-px border-y outline-none sm:grid-cols-2 lg:grid-cols-3"
        id={listId}
        ref={listRef}
        tabIndex={-1}
      >
        {features.map((feature, index) => (
          <li
            className={`bg-background px-5 py-6 sm:px-6 ${state === "collapsed" ? collapsedClassName(index) : ""}`}
            key={feature.title}
          >
            <h3 className="font-display text-foreground break-phrase text-lg">
              {feature.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {feature.body}
            </p>
          </li>
        ))}
      </ul>
      {state === "open" ? null : (
        <div
          className={`from-background pointer-events-none absolute inset-x-0 bottom-0 flex h-32 items-end justify-center bg-linear-to-t transition-opacity duration-700 motion-reduce:transition-none ${state === "opening" ? "opacity-0" : ""}`}
          data-feature-grid-fade=""
        >
          <button
            aria-controls={listId}
            aria-expanded={state !== "collapsed"}
            className={`border-primary bg-background text-primary hover:bg-accent rounded-sm border px-5 py-2.5 text-sm font-medium ${state === "collapsed" ? "pointer-events-auto" : ""}`}
            onClick={open}
            type="button"
          >
            {showAllLabel}
          </button>
        </div>
      )}
      <noscript>
        <style>{noscriptStyle}</style>
      </noscript>
    </div>
  );
};
