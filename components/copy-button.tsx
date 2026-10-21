"use client";

import { useEffect, useState } from "react";

interface CopyButtonProps {
  readonly className?: string;
  /** The text the button puts on the clipboard. */
  readonly code: string;
  /** Announced once the text is on the clipboard. */
  readonly copiedNotice: string;
  readonly label: string;
}

/** How long the check mark stays after a copy, in milliseconds. */
const copiedFor = 2000;

/**
 * Puts a code block's text on the clipboard. The icon turns into a check mark
 * for a moment, and a live region tells a screen reader the same.
 */
export const CopyButton = ({
  className = "",
  code,
  copiedNotice,
  label,
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = setTimeout(() => setCopied(false), copiedFor);

    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Withheld outside a secure context or by a denied permission. The code
      // can still be selected by hand.
    }
  };

  return (
    <>
      <button
        aria-label={label}
        className={`border-border bg-muted text-muted-foreground hover:text-primary flex size-7 shrink-0 items-center justify-center rounded-sm border ${className}`}
        onClick={copy}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          {copied ? (
            <path d="m5 12 5 5L20 7" />
          ) : (
            <>
              <rect height="11" rx="2" width="11" x="9" y="9" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </>
          )}
        </svg>
      </button>
      {/* Outside the button, so that the button keeps its name. */}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedNotice : null}
      </span>
    </>
  );
};
