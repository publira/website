import type { ReactNode } from "react";

interface BrowserFrameProps {
  readonly address: string;
  readonly children: ReactNode;
}

export const BrowserFrame = ({ address, children }: BrowserFrameProps) => (
  <div className="border-line bg-surface overflow-hidden rounded-xl border shadow-[0_18px_50px_-28px_rgba(27,40,54,0.45)]">
    <div className="border-line bg-canvas-deep/60 flex items-center gap-3 border-b px-4 py-2.5">
      <span aria-hidden="true" className="flex gap-1.5">
        <span className="bg-terracotta/60 size-2.5 rounded-full" />
        <span className="bg-sage/60 size-2.5 rounded-full" />
        <span className="bg-teal/40 size-2.5 rounded-full" />
      </span>
      <span className="bg-surface text-ink-soft truncate rounded-full px-3 py-0.5 font-mono text-xs">
        {address}
      </span>
    </div>
    {children}
  </div>
);
