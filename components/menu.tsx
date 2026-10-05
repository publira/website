"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

interface MenuProps {
  /** The side of the summary the list lines up with. */
  readonly align?: "left" | "right";
  /** The links, each in an `<li>`. */
  readonly children: ReactNode;
  readonly label: string;
  readonly summary: ReactNode;
  readonly summaryClassName: string;
}

/**
 * A list of links as a disclosure rather than a row, so it keeps its width
 * however many there are. It opens and closes without JavaScript; the effect
 * only adds closing on Escape, on a click outside it, and on a link in it.
 */
export const Menu = ({
  align = "right",
  children,
  label,
  summary,
  summaryClassName,
}: MenuProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) {
      return;
    }

    // Next.js keeps a page it has shown, so a menu left open by a link
    // followed from it would still be open when the reader comes back.
    const closeOnClick = (event: MouseEvent) => {
      const { target } = event;
      if (
        details.open &&
        target instanceof Element &&
        (!details.contains(target) || target.closest("a"))
      ) {
        details.open = false;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (details.open && event.key === "Escape") {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    };

    document.addEventListener("click", closeOnClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("click", closeOnClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <details className="group relative" ref={detailsRef}>
      <summary
        aria-label={label}
        className={`flex cursor-pointer list-none items-center gap-1.5 text-sm whitespace-nowrap [&::-webkit-details-marker]:hidden ${summaryClassName}`}
      >
        {summary}
        <svg
          aria-hidden="true"
          className="size-3 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <ul
        className={`border-border bg-popover absolute z-10 mt-2 ${align === "left" ? "left-0" : "right-0"} min-w-36 rounded-md border py-1 text-sm shadow-sm`}
      >
        {children}
      </ul>
    </details>
  );
};
