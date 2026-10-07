"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

interface DocsNavigationProps {
  /** The page list. */
  readonly children: ReactNode;
  readonly label: string;
  /** The current page's title, which the closed list shows below `lg`. */
  readonly summary: string;
}

/**
 * The docs pages as a disclosure below `lg`, so the article starts right
 * under it, and as a plain list at `lg` and wider, open or not. A browser
 * without `::details-content` keeps the toggle at `lg`, since it could not
 * show the closed list.
 */
export const DocsNavigation = ({
  children,
  label,
  summary,
}: DocsNavigationProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) {
      return;
    }

    // Next.js keeps a page it has shown, so a list left open by a link
    // followed from it would still be open when the reader comes back.
    const closeOnLink = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        details.open = false;
      }
    };

    details.addEventListener("click", closeOnLink);

    return () => {
      details.removeEventListener("click", closeOnLink);
    };
  }, []);

  return (
    <nav aria-label={label} className="mt-4 lg:mt-6">
      <details
        className="group lg:details-content:[content-visibility:visible]"
        ref={detailsRef}
      >
        <summary className="border-border text-foreground hover:bg-accent flex cursor-pointer list-none items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm supports-[selector(::details-content)]:lg:hidden [&::-webkit-details-marker]:hidden">
          <span className="truncate">{summary}</span>
          <svg
            aria-hidden="true"
            className="size-3 shrink-0 transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <div className="mt-3 supports-[selector(::details-content)]:lg:mt-0">
          {children}
        </div>
      </details>
    </nav>
  );
};
