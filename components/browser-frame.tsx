import type { ReactNode } from "react";

interface BrowserFrameProps {
  readonly address: string;
  readonly children: ReactNode;
}

export const BrowserFrame = ({ address, children }: BrowserFrameProps) => (
  <div className="border-line bg-surface overflow-hidden rounded-lg border">
    <div className="border-line bg-canvas-deep flex items-center gap-3 border-b px-4 py-2.5">
      <svg
        aria-hidden="true"
        className="fill-line shrink-0"
        height="8"
        viewBox="0 0 32 8"
        width="32"
      >
        <circle cx="4" cy="4" r="4" />
        <circle cx="16" cy="4" r="4" />
        <circle cx="28" cy="4" r="4" />
      </svg>
      <span className="border-line bg-surface text-ink-soft truncate rounded-sm border px-3 py-0.5 text-xs">
        {address}
      </span>
    </div>
    {children}
  </div>
);
