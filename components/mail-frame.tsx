import type { ReactNode } from "react";

interface MailFrameProps {
  readonly children: ReactNode;
}

/** A message open in a mail client, drawn as the pane around its body. */
export const MailFrame = ({ children }: MailFrameProps) => (
  <div className="border-border bg-card mx-auto max-w-xs overflow-hidden rounded-lg border">
    <div
      aria-hidden="true"
      className="border-border bg-muted space-y-1.5 border-b px-4 py-3"
    >
      <span className="bg-border block h-1.5 w-2/5 rounded-full" />
      <span className="bg-border block h-1.5 w-3/5 rounded-full" />
    </div>
    {children}
  </div>
);
